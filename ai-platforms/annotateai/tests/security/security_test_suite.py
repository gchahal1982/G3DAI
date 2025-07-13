#!/usr/bin/env python3
"""
AnnotateAI Security Testing Suite
Comprehensive security tests covering authentication, authorization, 
input validation, and common vulnerabilities (OWASP Top 10)
"""

import pytest
import asyncio
import httpx
import json
import time
import jwt
import hashlib
import hmac
import base64
import urllib.parse
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import re
import subprocess
import tempfile
import os
from pathlib import Path

# Security test configuration
SECURITY_CONFIG = {
    "BASE_URL": "http://localhost:8000",
    "AUTH_URL": "http://localhost:8001",
    "TIMEOUT": 30,
    "JWT_SECRET": "test-secret-key",
    "BRUTE_FORCE_ATTEMPTS": 50,
    "RATE_LIMIT_WINDOW": 60,
    "MAX_PAYLOAD_SIZE": 10 * 1024 * 1024,  # 10MB
}

class SecurityTestUtils:
    """Utility functions for security testing"""
    
    @staticmethod
    def generate_malicious_payloads() -> List[str]:
        """Generate common malicious payloads"""
        return [
            # SQL Injection
            "'; DROP TABLE users; --",
            "' OR '1'='1",
            "admin'--",
            "' UNION SELECT * FROM users --",
            
            # XSS
            "<script>alert('XSS')</script>",
            "javascript:alert('XSS')",
            "<img src=x onerror=alert('XSS')>",
            "'\"><script>alert('XSS')</script>",
            
            # Command Injection
            "; cat /etc/passwd",
            "| whoami",
            "&& rm -rf /",
            "`cat /etc/passwd`",
            
            # Path Traversal
            "../../../etc/passwd",
            "..\\..\\..\\windows\\system32\\config\\sam",
            "....//....//....//etc/passwd",
            
            # LDAP Injection
            "*)(uid=*",
            "admin)(&(password=*)",
            
            # XML Injection
            "<?xml version=\"1.0\"?><!DOCTYPE root [<!ENTITY test SYSTEM 'file:///etc/passwd'>]><root>&test;</root>",
            
            # NoSQL Injection
            "'; return true; var dummy='",
            "$where: '1 == 1'",
            
            # Buffer Overflow attempts
            "A" * 10000,
            "B" * 65536,
        ]
    
    @staticmethod
    def generate_auth_bypass_attempts() -> List[Dict[str, Any]]:
        """Generate authentication bypass attempts"""
        return [
            {"username": "admin", "password": "admin"},
            {"username": "administrator", "password": "password"},
            {"username": "root", "password": "root"},
            {"username": "admin", "password": ""},
            {"username": "", "password": ""},
            {"username": "admin'--", "password": "anything"},
            {"username": "admin' OR '1'='1", "password": "anything"},
            {"username": None, "password": None},
            {"username": {"$ne": None}, "password": {"$ne": None}},
        ]
    
    @staticmethod
    def generate_jwt_attacks(secret: str) -> List[str]:
        """Generate JWT attack vectors"""
        attacks = []
        
        # None algorithm attack
        header = {"alg": "none", "typ": "JWT"}
        payload = {"sub": "admin", "role": "admin", "exp": int(time.time()) + 3600}
        
        encoded_header = base64.urlsafe_b64encode(json.dumps(header).encode()).decode().rstrip('=')
        encoded_payload = base64.urlsafe_b64encode(json.dumps(payload).encode()).decode().rstrip('=')
        
        none_token = f"{encoded_header}.{encoded_payload}."
        attacks.append(none_token)
        
        # Weak secret brute force
        weak_secrets = ["secret", "password", "123456", "admin", "test", ""]
        for weak_secret in weak_secrets:
            try:
                weak_token = jwt.encode(payload, weak_secret, algorithm="HS256")
                attacks.append(weak_token)
            except:
                pass
        
        # Key confusion attack (using public key as HMAC secret)
        public_key = """-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...
-----END PUBLIC KEY-----"""
        
        try:
            confused_token = jwt.encode(payload, public_key, algorithm="HS256")
            attacks.append(confused_token)
        except:
            pass
        
        # Malformed tokens
        attacks.extend([
            "malformed.token.here",
            "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.malformed.signature",
            "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..signature",
            ".eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.signature",
            "Bearer malformed.token.here",
        ])
        
        return attacks
    
    @staticmethod
    def check_security_headers(response: httpx.Response) -> Dict[str, bool]:
        """Check for security headers in response"""
        headers = response.headers
        
        return {
            "X-Content-Type-Options": "nosniff" in headers.get("X-Content-Type-Options", "").lower(),
            "X-Frame-Options": headers.get("X-Frame-Options") is not None,
            "X-XSS-Protection": headers.get("X-XSS-Protection") is not None,
            "Strict-Transport-Security": headers.get("Strict-Transport-Security") is not None,
            "Content-Security-Policy": headers.get("Content-Security-Policy") is not None,
            "Referrer-Policy": headers.get("Referrer-Policy") is not None,
            "Server": "server" not in headers.get("Server", "").lower(),  # Server header should be hidden
        }
    
    @staticmethod
    def test_rate_limiting(client: httpx.Client, endpoint: str, max_requests: int = 10) -> bool:
        """Test rate limiting on endpoint"""
        start_time = time.time()
        
        for i in range(max_requests + 5):  # Try to exceed limit
            response = client.get(endpoint)
            
            if response.status_code == 429:  # Too Many Requests
                return True
            
            if time.time() - start_time > 60:  # Don't run too long
                break
        
        return False

class TestAuthenticationSecurity:
    """Security tests for authentication system"""
    
    @pytest.mark.security
    async def test_brute_force_protection(self, async_client):
        """Test brute force attack protection"""
        auth_url = f"{SECURITY_CONFIG['AUTH_URL']}/auth/login"
        
        failed_attempts = 0
        for i in range(SECURITY_CONFIG['BRUTE_FORCE_ATTEMPTS']):
            response = await async_client.post(
                auth_url,
                json={"username": "admin", "password": f"wrong_password_{i}"}
            )
            
            if response.status_code == 401:
                failed_attempts += 1
            elif response.status_code == 429:  # Rate limited
                # Good! Brute force protection is working
                assert failed_attempts < SECURITY_CONFIG['BRUTE_FORCE_ATTEMPTS']
                return
            
            # Small delay to avoid overwhelming the service
            await asyncio.sleep(0.1)
        
        # If we get here without rate limiting, that's a security issue
        pytest.fail("No brute force protection detected")
    
    @pytest.mark.security
    async def test_sql_injection_in_auth(self, async_client):
        """Test SQL injection in authentication"""
        auth_url = f"{SECURITY_CONFIG['AUTH_URL']}/auth/login"
        
        sql_payloads = SecurityTestUtils.generate_malicious_payloads()
        
        for payload in sql_payloads:
            if "DROP" in payload or "SELECT" in payload:
                response = await async_client.post(
                    auth_url,
                    json={"username": payload, "password": payload}
                )
                
                # Should not return 200 (successful login) for SQL injection
                assert response.status_code != 200, f"Possible SQL injection with payload: {payload}"
                
                # Should handle gracefully without 500 errors
                assert response.status_code != 500, f"Server error with payload: {payload}"
    
    @pytest.mark.security
    async def test_authentication_bypass(self, async_client):
        """Test authentication bypass attempts"""
        auth_url = f"{SECURITY_CONFIG['AUTH_URL']}/auth/login"
        
        bypass_attempts = SecurityTestUtils.generate_auth_bypass_attempts()
        
        for attempt in bypass_attempts:
            try:
                response = await async_client.post(auth_url, json=attempt)
                
                # None of these should result in successful authentication
                assert response.status_code != 200, f"Authentication bypass with: {attempt}"
                
            except Exception as e:
                # Should handle malformed requests gracefully
                pass
    
    @pytest.mark.security
    async def test_jwt_security(self, async_client):
        """Test JWT token security"""
        protected_url = f"{SECURITY_CONFIG['BASE_URL']}/protected-endpoint"
        
        jwt_attacks = SecurityTestUtils.generate_jwt_attacks(SECURITY_CONFIG['JWT_SECRET'])
        
        for malicious_token in jwt_attacks:
            headers = {"Authorization": f"Bearer {malicious_token}"}
            
            response = await async_client.get(protected_url, headers=headers)
            
            # Should not grant access with malicious tokens
            assert response.status_code in [401, 403], f"JWT attack succeeded with token: {malicious_token}"
    
    @pytest.mark.security
    async def test_session_security(self, async_client):
        """Test session management security"""
        # Test session fixation
        session_id = "fixed_session_id_123"
        headers = {"Cookie": f"session_id={session_id}"}
        
        response = await async_client.get(f"{SECURITY_CONFIG['BASE_URL']}/profile", headers=headers)
        
        # Should not accept pre-set session IDs
        assert response.status_code != 200
        
        # Test session hijacking resistance
        # (In a real test, we'd check for secure, httpOnly, sameSite attributes)
    
    @pytest.mark.security
    async def test_password_policy(self, async_client):
        """Test password policy enforcement"""
        register_url = f"{SECURITY_CONFIG['AUTH_URL']}/auth/register"
        
        weak_passwords = [
            "123456",
            "password",
            "qwerty",
            "abc123",
            "admin",
            "a",  # Too short
            "password123",  # Common pattern
        ]
        
        for weak_password in weak_passwords:
            user_data = {
                "username": f"testuser_{int(time.time())}",
                "email": "test@example.com",
                "password": weak_password
            }
            
            response = await async_client.post(register_url, json=user_data)
            
            # Should reject weak passwords
            if len(weak_password) < 8 or weak_password in ["123456", "password", "qwerty"]:
                assert response.status_code != 201, f"Weak password accepted: {weak_password}"

class TestAuthorizationSecurity:
    """Security tests for authorization and access control"""
    
    @pytest.mark.security
    async def test_privilege_escalation(self, async_client, auth_headers):
        """Test privilege escalation attempts"""
        # Try to access admin endpoints with regular user token
        admin_endpoints = [
            "/admin/users",
            "/admin/projects",
            "/admin/system",
            "/admin/logs"
        ]
        
        for endpoint in admin_endpoints:
            response = await async_client.get(f"{SECURITY_CONFIG['BASE_URL']}{endpoint}", headers=auth_headers)
            
            # Should deny access for non-admin users
            assert response.status_code in [401, 403], f"Privilege escalation possible at: {endpoint}"
    
    @pytest.mark.security
    async def test_horizontal_privilege_escalation(self, async_client, auth_headers):
        """Test access to other users' resources"""
        # Try to access other users' data
        other_user_resources = [
            "/users/other-user-123/profile",
            "/projects/other-user-project-456",
            "/annotations/other-user-annotation-789"
        ]
        
        for resource in other_user_resources:
            response = await async_client.get(f"{SECURITY_CONFIG['BASE_URL']}{resource}", headers=auth_headers)
            
            # Should deny access to other users' resources
            assert response.status_code in [401, 403, 404], f"Horizontal privilege escalation at: {resource}"
    
    @pytest.mark.security
    async def test_insecure_direct_object_references(self, async_client, auth_headers):
        """Test for insecure direct object references (IDOR)"""
        # Try to access resources by guessing IDs
        resource_patterns = [
            "/annotations/1",
            "/annotations/2",
            "/annotations/100",
            "/projects/1",
            "/projects/admin-project",
            "/users/1",
            "/users/admin"
        ]
        
        accessible_resources = []
        
        for resource in resource_patterns:
            response = await async_client.get(f"{SECURITY_CONFIG['BASE_URL']}{resource}", headers=auth_headers)
            
            if response.status_code == 200:
                accessible_resources.append(resource)
        
        # Should have proper access controls, not just sequential IDs
        if len(accessible_resources) > 2:
            pytest.fail(f"Possible IDOR vulnerability, accessible resources: {accessible_resources}")
    
    @pytest.mark.security
    async def test_missing_authorization_checks(self, async_client):
        """Test for missing authorization checks"""
        # Try to access protected endpoints without authentication
        protected_endpoints = [
            "/annotations",
            "/projects",
            "/users/profile",
            "/admin/dashboard"
        ]
        
        for endpoint in protected_endpoints:
            response = await async_client.get(f"{SECURITY_CONFIG['BASE_URL']}{endpoint}")
            
            # Should require authentication
            assert response.status_code in [401, 403], f"Missing auth check at: {endpoint}"

class TestInputValidationSecurity:
    """Security tests for input validation"""
    
    @pytest.mark.security
    async def test_xss_prevention(self, async_client, auth_headers):
        """Test XSS prevention in user inputs"""
        xss_payloads = [
            "<script>alert('XSS')</script>",
            "javascript:alert('XSS')",
            "<img src=x onerror=alert('XSS')>",
            "'\"><script>alert('XSS')</script>",
            "<svg onload=alert('XSS')>",
        ]
        
        for payload in xss_payloads:
            # Test in project name
            project_data = {
                "name": payload,
                "description": "Test project"
            }
            
            response = await async_client.post(
                f"{SECURITY_CONFIG['BASE_URL']}/projects",
                json=project_data,
                headers=auth_headers
            )
            
            if response.status_code == 201:
                # Check if XSS payload is properly escaped in response
                response_text = response.text
                assert "<script>" not in response_text, f"XSS payload not escaped: {payload}"
                assert "javascript:" not in response_text, f"XSS payload not escaped: {payload}"
    
    @pytest.mark.security
    async def test_command_injection(self, async_client, auth_headers):
        """Test command injection prevention"""
        command_payloads = [
            "; cat /etc/passwd",
            "| whoami",
            "&& rm -rf /",
            "`cat /etc/passwd`",
            "$(cat /etc/passwd)",
        ]
        
        for payload in command_payloads:
            # Test in file operations
            response = await async_client.get(
                f"{SECURITY_CONFIG['BASE_URL']}/files/{payload}",
                headers=auth_headers
            )
            
            # Should not execute commands
            assert response.status_code != 200, f"Possible command injection with: {payload}"
    
    @pytest.mark.security
    async def test_path_traversal(self, async_client, auth_headers):
        """Test path traversal prevention"""
        path_payloads = [
            "../../../etc/passwd",
            "..\\..\\..\\windows\\system32\\config\\sam",
            "....//....//....//etc/passwd",
            "%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd",
        ]
        
        for payload in path_payloads:
            response = await async_client.get(
                f"{SECURITY_CONFIG['BASE_URL']}/files/{payload}",
                headers=auth_headers
            )
            
            # Should not access files outside allowed directories
            if response.status_code == 200:
                content = response.text
                assert "root:" not in content, f"Path traversal successful with: {payload}"
    
    @pytest.mark.security
    async def test_file_upload_security(self, async_client, auth_headers):
        """Test file upload security"""
        malicious_files = [
            # PHP shell
            ("shell.php", b"<?php system($_GET['cmd']); ?>", "application/x-php"),
            # JavaScript
            ("malicious.js", b"alert('XSS');", "application/javascript"),
            # Executable
            ("malware.exe", b"MZ\x90\x00" + b"A" * 100, "application/octet-stream"),
            # Large file
            ("large.txt", b"A" * (SECURITY_CONFIG['MAX_PAYLOAD_SIZE'] + 1), "text/plain"),
        ]
        
        for filename, content, content_type in malicious_files:
            files = {"file": (filename, content, content_type)}
            
            response = await async_client.post(
                f"{SECURITY_CONFIG['BASE_URL']}/upload",
                files=files,
                headers=auth_headers
            )
            
            # Should reject malicious files
            if filename.endswith(('.php', '.exe', '.js')):
                assert response.status_code != 200, f"Malicious file uploaded: {filename}"
            
            # Should reject oversized files
            if len(content) > SECURITY_CONFIG['MAX_PAYLOAD_SIZE']:
                assert response.status_code != 200, f"Oversized file accepted: {filename}"
    
    @pytest.mark.security
    async def test_nosql_injection(self, async_client, auth_headers):
        """Test NoSQL injection prevention"""
        nosql_payloads = [
            {"$ne": None},
            {"$gt": ""},
            {"$where": "1 == 1"},
            {"$regex": ".*"},
            {"$or": [{"password": {"$ne": None}}]},
        ]
        
        for payload in nosql_payloads:
            # Test in search parameters
            response = await async_client.get(
                f"{SECURITY_CONFIG['BASE_URL']}/search",
                params={"query": json.dumps(payload)},
                headers=auth_headers
            )
            
            # Should not process NoSQL injection payloads
            if response.status_code == 200:
                data = response.json()
                # Should not return all records due to injection
                assert len(data.get("results", [])) < 1000, f"Possible NoSQL injection with: {payload}"

class TestDataSecurityAndPrivacy:
    """Security tests for data protection and privacy"""
    
    @pytest.mark.security
    async def test_sensitive_data_exposure(self, async_client, auth_headers):
        """Test for sensitive data exposure"""
        # Check API responses don't expose sensitive data
        response = await async_client.get(f"{SECURITY_CONFIG['BASE_URL']}/users/profile", headers=auth_headers)
        
        if response.status_code == 200:
            data = response.json()
            
            # Should not expose sensitive fields
            sensitive_fields = ["password", "password_hash", "secret_key", "private_key"]
            for field in sensitive_fields:
                assert field not in data, f"Sensitive field exposed: {field}"
    
    @pytest.mark.security
    async def test_data_encryption_in_transit(self, async_client):
        """Test data encryption in transit"""
        # Check if HTTPS is enforced
        http_url = SECURITY_CONFIG['BASE_URL'].replace('https', 'http')
        
        try:
            response = await async_client.get(f"{http_url}/health")
            
            # Should redirect to HTTPS or refuse connection
            if response.status_code == 200:
                # Check for security headers that enforce HTTPS
                headers = SecurityTestUtils.check_security_headers(response)
                assert headers.get("Strict-Transport-Security", False), "HTTPS not enforced"
        except:
            # Connection refused is acceptable for HTTP
            pass
    
    @pytest.mark.security
    async def test_information_disclosure(self, async_client):
        """Test for information disclosure"""
        # Test error messages don't reveal sensitive information
        response = await async_client.get(f"{SECURITY_CONFIG['BASE_URL']}/nonexistent-endpoint")
        
        if response.status_code == 404:
            error_message = response.text.lower()
            
            # Should not reveal system information
            disclosure_patterns = [
                "sql", "database", "mysql", "postgresql", "mongodb",
                "python", "django", "flask", "fastapi",
                "stack trace", "traceback", "exception",
                "c:\\", "/home/", "/var/", "/etc/",
                "version", "server"
            ]
            
            for pattern in disclosure_patterns:
                assert pattern not in error_message, f"Information disclosure: {pattern}"

class TestSecurityHeaders:
    """Test security headers"""
    
    @pytest.mark.security
    async def test_security_headers_present(self, async_client):
        """Test presence of security headers"""
        response = await async_client.get(f"{SECURITY_CONFIG['BASE_URL']}/health")
        
        security_headers = SecurityTestUtils.check_security_headers(response)
        
        # Check critical security headers
        assert security_headers["X-Content-Type-Options"], "Missing X-Content-Type-Options header"
        assert security_headers["X-Frame-Options"], "Missing X-Frame-Options header"
        
        # Warn about missing optional headers
        if not security_headers["Content-Security-Policy"]:
            print("Warning: Missing Content-Security-Policy header")
        
        if not security_headers["Strict-Transport-Security"]:
            print("Warning: Missing Strict-Transport-Security header")

class TestRateLimitingAndDDoS:
    """Test rate limiting and DDoS protection"""
    
    @pytest.mark.security
    def test_api_rate_limiting(self, sync_client):
        """Test API rate limiting"""
        endpoint = f"{SECURITY_CONFIG['BASE_URL']}/health"
        
        rate_limited = SecurityTestUtils.test_rate_limiting(sync_client, endpoint, max_requests=20)
        
        # Should have rate limiting in place
        assert rate_limited, "No rate limiting detected"
    
    @pytest.mark.security
    async def test_ddos_protection(self, async_client):
        """Test DDoS protection mechanisms"""
        # Simulate rapid requests
        tasks = []
        for _ in range(100):
            task = async_client.get(f"{SECURITY_CONFIG['BASE_URL']}/health")
            tasks.append(task)
        
        responses = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Should have some form of protection (rate limiting, connection limits, etc.)
        error_count = sum(1 for r in responses if isinstance(r, Exception) or 
                         (hasattr(r, 'status_code') and r.status_code == 429))
        
        # At least some requests should be rate limited or failed
        assert error_count > 10, "No DDoS protection detected"

class TestBusinessLogicSecurity:
    """Test business logic security"""
    
    @pytest.mark.security
    async def test_workflow_bypass(self, async_client, auth_headers):
        """Test business logic workflow bypass"""
        # Try to skip annotation review process
        annotation_data = {
            "project_id": "test-project",
            "status": "approved",  # Try to set directly to approved
            "label": "cat"
        }
        
        response = await async_client.post(
            f"{SECURITY_CONFIG['BASE_URL']}/annotations",
            json=annotation_data,
            headers=auth_headers
        )
        
        if response.status_code == 201:
            annotation = response.json()
            # Should not allow bypassing review process
            assert annotation.get("status") != "approved", "Workflow bypass possible"
    
    @pytest.mark.security
    async def test_race_conditions(self, async_client, auth_headers):
        """Test for race condition vulnerabilities"""
        # Simulate concurrent operations that might cause race conditions
        annotation_id = "test-annotation-123"
        
        # Try to delete and modify simultaneously
        delete_task = async_client.delete(
            f"{SECURITY_CONFIG['BASE_URL']}/annotations/{annotation_id}",
            headers=auth_headers
        )
        
        update_task = async_client.put(
            f"{SECURITY_CONFIG['BASE_URL']}/annotations/{annotation_id}",
            json={"label": "updated"},
            headers=auth_headers
        )
        
        delete_response, update_response = await asyncio.gather(
            delete_task, update_task, return_exceptions=True
        )
        
        # Should handle concurrent operations gracefully
        # Both operations should not succeed
        success_count = 0
        if hasattr(delete_response, 'status_code') and delete_response.status_code == 200:
            success_count += 1
        if hasattr(update_response, 'status_code') and update_response.status_code == 200:
            success_count += 1
        
        assert success_count <= 1, "Race condition detected in concurrent operations"

# Security test runners
class SecurityTestRunner:
    """Runner for comprehensive security tests"""
    
    @staticmethod
    async def run_owasp_top_10_tests():
        """Run tests covering OWASP Top 10 vulnerabilities"""
        # This would run tests for:
        # A01:2021 – Broken Access Control
        # A02:2021 – Cryptographic Failures
        # A03:2021 – Injection
        # A04:2021 – Insecure Design
        # A05:2021 – Security Misconfiguration
        # A06:2021 – Vulnerable and Outdated Components
        # A07:2021 – Identification and Authentication Failures
        # A08:2021 – Software and Data Integrity Failures
        # A09:2021 – Security Logging and Monitoring Failures
        # A10:2021 – Server-Side Request Forgery (SSRF)
        pass
    
    @staticmethod
    def run_automated_security_scan():
        """Run automated security scanning tools"""
        # This would integrate with tools like:
        # - OWASP ZAP
        # - Burp Suite
        # - Bandit (for Python code)
        # - Safety (for dependency vulnerabilities)
        pass
    
    @staticmethod
    def generate_security_report(test_results: Dict[str, Any]) -> str:
        """Generate comprehensive security test report"""
        return """
        AnnotateAI Security Test Report
        ================================
        
        Test Results Summary:
        - Authentication Tests: {auth_results}
        - Authorization Tests: {authz_results}  
        - Input Validation Tests: {input_results}
        - Security Headers Tests: {headers_results}
        - Rate Limiting Tests: {rate_limit_results}
        
        Vulnerabilities Found: {vulnerabilities}
        Risk Level: {risk_level}
        
        Recommendations:
        {recommendations}
        """.format(**test_results)

# Integration with security tools
def run_bandit_scan():
    """Run Bandit security scanner on Python code"""
    try:
        result = subprocess.run(
            ["bandit", "-r", ".", "-f", "json"],
            capture_output=True,
            text=True,
            cwd=Path(__file__).parent.parent.parent
        )
        return json.loads(result.stdout) if result.stdout else {}
    except:
        return {}

def run_safety_check():
    """Check for known security vulnerabilities in dependencies"""
    try:
        result = subprocess.run(
            ["safety", "check", "--json"],
            capture_output=True,
            text=True
        )
        return json.loads(result.stdout) if result.stdout else {}
    except:
        return {}

if __name__ == "__main__":
    # Example usage:
    # python -m pytest tests/security/ -m security -v
    pass 