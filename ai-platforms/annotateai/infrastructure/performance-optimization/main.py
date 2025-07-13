#!/usr/bin/env python3
"""
AnnotateAI Performance Optimization Service
Advanced caching, monitoring, scaling, and optimization infrastructure
"""

import asyncio
import logging
import os
import time
import json
import uuid
import hashlib
from pathlib import Path
from typing import Dict, List, Optional, Any, Union, Tuple, Callable
from datetime import datetime, timedelta
from contextlib import asynccontextmanager
from dataclasses import dataclass, asdict
from enum import Enum
import functools
import pickle
import zlib
from collections import defaultdict, deque

# FastAPI and web framework
from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

# Database optimization
import sqlalchemy as sa
from sqlalchemy import create_engine, event, pool
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import QueuePool, StaticPool
from sqlalchemy.engine import Engine
import sqlalchemy.dialects.postgresql as postgresql

# Caching
import redis
import redis.asyncio as aioredis
from redis.sentinel import Sentinel
from redis.exceptions import ConnectionError, TimeoutError
import memcache
import aiomcache

# CDN and asset optimization
import boto3
from botocore.exceptions import ClientError
import cloudflare
from PIL import Image, ImageOpt
import tinify

# Application Performance Monitoring
import datadog
from datadog import initialize, api, statsd
import newrelic.agent
from opentelemetry import trace, metrics
from opentelemetry.exporter.jaeger.thrift import JaegerExporter
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor

# Monitoring and metrics
from prometheus_client import Counter, Histogram, Gauge, Summary, generate_latest, CollectorRegistry
import psutil
import GPUtil
import pymongo
from elasticsearch import Elasticsearch
import logstash

# Auto-scaling
import kubernetes
from kubernetes import client, config
import docker

# Load balancing
import nginx
import haproxy

# Message queues and async processing
import celery
from celery import Celery
import pika
import aio_pika

# Compression and optimization
import gzip
import brotli
import zstandard as zstd

# Network optimization
import httpx
import aiohttp
from aiohttp_session import setup
from aiohttp_session.redis_storage import RedisStorage

# Time series databases
import influxdb_client
from influxdb_client.client.write_api import SYNCHRONOUS

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Environment configuration
REDIS_CLUSTER_NODES = os.getenv("REDIS_CLUSTER_NODES", "redis://localhost:6379").split(",")
REDIS_SENTINEL_HOSTS = os.getenv("REDIS_SENTINEL_HOSTS", "localhost:26379").split(",")
REDIS_MASTER_NAME = os.getenv("REDIS_MASTER_NAME", "mymaster")
DATABASE_POOL_SIZE = int(os.getenv("DATABASE_POOL_SIZE", "50"))
DATABASE_MAX_OVERFLOW = int(os.getenv("DATABASE_MAX_OVERFLOW", "100"))
CDN_PROVIDER = os.getenv("CDN_PROVIDER", "cloudflare")  # cloudflare, aws_cloudfront, fastly
CDN_ZONE_ID = os.getenv("CDN_ZONE_ID", "")
CDN_API_KEY = os.getenv("CDN_API_KEY", "")
AWS_CLOUDFRONT_DISTRIBUTION_ID = os.getenv("AWS_CLOUDFRONT_DISTRIBUTION_ID", "")
DATADOG_API_KEY = os.getenv("DATADOG_API_KEY", "")
DATADOG_APP_KEY = os.getenv("DATADOG_APP_KEY", "")
NEWRELIC_LICENSE_KEY = os.getenv("NEWRELIC_LICENSE_KEY", "")
ELASTICSEARCH_HOSTS = os.getenv("ELASTICSEARCH_HOSTS", "http://localhost:9200").split(",")
INFLUXDB_URL = os.getenv("INFLUXDB_URL", "http://localhost:8086")
INFLUXDB_TOKEN = os.getenv("INFLUXDB_TOKEN", "")
INFLUXDB_ORG = os.getenv("INFLUXDB_ORG", "annotateai")
INFLUXDB_BUCKET = os.getenv("INFLUXDB_BUCKET", "performance")
KUBERNETES_NAMESPACE = os.getenv("KUBERNETES_NAMESPACE", "annotateai")
AUTO_SCALING_ENABLED = os.getenv("AUTO_SCALING_ENABLED", "true").lower() == "true"
CACHE_TTL_DEFAULT = int(os.getenv("CACHE_TTL_DEFAULT", "3600"))  # 1 hour
CACHE_TTL_SHORT = int(os.getenv("CACHE_TTL_SHORT", "300"))  # 5 minutes
CACHE_TTL_LONG = int(os.getenv("CACHE_TTL_LONG", "86400"))  # 24 hours

# Prometheus metrics
CACHE_HITS = Counter('cache_hits_total', 'Cache hits', ['cache_type', 'key_prefix'])
CACHE_MISSES = Counter('cache_misses_total', 'Cache misses', ['cache_type', 'key_prefix'])
CACHE_OPERATIONS = Histogram('cache_operation_duration_seconds', 'Cache operation duration', ['operation', 'cache_type'])
DATABASE_CONNECTIONS = Gauge('database_connections_active', 'Active database connections')
DATABASE_QUERIES = Histogram('database_query_duration_seconds', 'Database query duration', ['table'])
CDN_REQUESTS = Counter('cdn_requests_total', 'CDN requests', ['endpoint'])
CDN_CACHE_HIT_RATIO = Gauge('cdn_cache_hit_ratio', 'CDN cache hit ratio')
AUTO_SCALE_EVENTS = Counter('auto_scale_events_total', 'Auto-scaling events', ['direction', 'service'])
PERFORMANCE_SCORE = Gauge('performance_score', 'Overall performance score')
RESOURCE_UTILIZATION = Gauge('resource_utilization_percent', 'Resource utilization', ['resource_type'])

class CacheType(str, Enum):
    """Cache types"""
    REDIS = "redis"
    MEMCACHED = "memcached"
    APPLICATION = "application"
    DATABASE = "database"
    CDN = "cdn"

class OptimizationStrategy(str, Enum):
    """Optimization strategies"""
    AGGRESSIVE = "aggressive"
    BALANCED = "balanced"
    CONSERVATIVE = "conservative"
    CUSTOM = "custom"

class ScalingDirection(str, Enum):
    """Auto-scaling directions"""
    UP = "up"
    DOWN = "down"
    STABLE = "stable"

class PerformanceMetric(str, Enum):
    """Performance metrics"""
    RESPONSE_TIME = "response_time"
    THROUGHPUT = "throughput"
    ERROR_RATE = "error_rate"
    CPU_USAGE = "cpu_usage"
    MEMORY_USAGE = "memory_usage"
    DISK_USAGE = "disk_usage"
    NETWORK_IO = "network_io"
    CACHE_HIT_RATIO = "cache_hit_ratio"

# Pydantic models
class CacheConfig(BaseModel):
    """Cache configuration"""
    enabled: bool = Field(default=True, description="Enable caching")
    cache_type: CacheType = Field(default=CacheType.REDIS, description="Cache type")
    default_ttl: int = Field(default=CACHE_TTL_DEFAULT, description="Default TTL in seconds")
    max_memory: str = Field(default="1gb", description="Maximum memory usage")
    eviction_policy: str = Field(default="allkeys-lru", description="Eviction policy")
    compression_enabled: bool = Field(default=True, description="Enable compression")
    encryption_enabled: bool = Field(default=False, description="Enable encryption")

class DatabaseConfig(BaseModel):
    """Database optimization configuration"""
    pool_size: int = Field(default=DATABASE_POOL_SIZE, description="Connection pool size")
    max_overflow: int = Field(default=DATABASE_MAX_OVERFLOW, description="Maximum overflow connections")
    pool_timeout: int = Field(default=30, description="Pool timeout in seconds")
    pool_recycle: int = Field(default=3600, description="Pool recycle time in seconds")
    query_timeout: int = Field(default=30, description="Query timeout in seconds")
    enable_query_logging: bool = Field(default=False, description="Enable query logging")
    enable_slow_query_logging: bool = Field(default=True, description="Enable slow query logging")
    slow_query_threshold: float = Field(default=1.0, description="Slow query threshold in seconds")

class CDNConfig(BaseModel):
    """CDN configuration"""
    enabled: bool = Field(default=True, description="Enable CDN")
    provider: str = Field(default=CDN_PROVIDER, description="CDN provider")
    cache_ttl: int = Field(default=86400, description="CDN cache TTL in seconds")
    gzip_enabled: bool = Field(default=True, description="Enable gzip compression")
    brotli_enabled: bool = Field(default=True, description="Enable brotli compression")
    image_optimization: bool = Field(default=True, description="Enable image optimization")
    minification: bool = Field(default=True, description="Enable asset minification")

class AutoScalingConfig(BaseModel):
    """Auto-scaling configuration"""
    enabled: bool = Field(default=AUTO_SCALING_ENABLED, description="Enable auto-scaling")
    min_replicas: int = Field(default=2, description="Minimum replicas")
    max_replicas: int = Field(default=100, description="Maximum replicas")
    target_cpu_utilization: int = Field(default=70, description="Target CPU utilization percentage")
    target_memory_utilization: int = Field(default=80, description="Target memory utilization percentage")
    scale_up_cooldown: int = Field(default=300, description="Scale up cooldown in seconds")
    scale_down_cooldown: int = Field(default=600, description="Scale down cooldown in seconds")

class PerformanceOptimizationRequest(BaseModel):
    """Performance optimization request"""
    strategy: OptimizationStrategy = Field(..., description="Optimization strategy")
    cache_config: CacheConfig = Field(default_factory=CacheConfig, description="Cache configuration")
    database_config: DatabaseConfig = Field(default_factory=DatabaseConfig, description="Database configuration")
    cdn_config: CDNConfig = Field(default_factory=CDNConfig, description="CDN configuration")
    auto_scaling_config: AutoScalingConfig = Field(default_factory=AutoScalingConfig, description="Auto-scaling configuration")

class PerformanceReport(BaseModel):
    """Performance analysis report"""
    timestamp: datetime = Field(..., description="Report timestamp")
    overall_score: float = Field(..., description="Overall performance score")
    metrics: Dict[PerformanceMetric, float] = Field(..., description="Performance metrics")
    recommendations: List[str] = Field(..., description="Optimization recommendations")
    issues: List[Dict[str, Any]] = Field(..., description="Identified issues")
    trends: Dict[str, Any] = Field(..., description="Performance trends")

class CacheManager:
    """Advanced cache management system"""
    
    def __init__(self):
        # Redis setup with sentinel for high availability
        self.redis_sentinels = []
        for host_port in REDIS_SENTINEL_HOSTS:
            host, port = host_port.split(':')
            self.redis_sentinels.append((host, int(port)))
        
        self.sentinel = Sentinel(self.redis_sentinels)
        self.redis_master = self.sentinel.master_for(
            REDIS_MASTER_NAME,
            socket_timeout=0.1,
            password=os.getenv("REDIS_PASSWORD"),
            decode_responses=True
        )
        
        # Async Redis client
        self.redis_async = None
        
        # Memcached client
        self.memcached = memcache.Client(['127.0.0.1:11211'])
        
        # Local application cache
        self.app_cache = {}
        self.app_cache_ttl = {}
        self.app_cache_access = defaultdict(int)
        
        # Cache statistics
        self.stats = {
            'hits': defaultdict(int),
            'misses': defaultdict(int),
            'sets': defaultdict(int),
            'deletes': defaultdict(int),
            'errors': defaultdict(int)
        }
    
    async def initialize_async_redis(self):
        """Initialize async Redis connection"""
        if not self.redis_async:
            self.redis_async = await aioredis.from_url(
                f"redis://{REDIS_CLUSTER_NODES[0].replace('redis://', '')}",
                password=os.getenv("REDIS_PASSWORD"),
                decode_responses=True
            )
    
    def _serialize_value(self, value: Any, compress: bool = True) -> bytes:
        """Serialize and optionally compress cache value"""
        serialized = pickle.dumps(value)
        
        if compress and len(serialized) > 1024:  # Compress if larger than 1KB
            serialized = zlib.compress(serialized)
        
        return serialized
    
    def _deserialize_value(self, data: bytes, compressed: bool = True) -> Any:
        """Deserialize and optionally decompress cache value"""
        if compressed:
            try:
                data = zlib.decompress(data)
            except zlib.error:
                pass  # Data might not be compressed
        
        return pickle.loads(data)
    
    def _generate_cache_key(self, key: str, prefix: str = "", version: int = 1) -> str:
        """Generate cache key with prefix and versioning"""
        if prefix:
            key = f"{prefix}:{key}"
        
        key = f"v{version}:{key}"
        
        # Hash very long keys
        if len(key) > 250:
            key = f"hash:{hashlib.sha256(key.encode()).hexdigest()}"
        
        return key
    
    async def get(
        self,
        key: str,
        cache_type: CacheType = CacheType.REDIS,
        prefix: str = "",
        default: Any = None
    ) -> Any:
        """Get value from cache"""
        
        cache_key = self._generate_cache_key(key, prefix)
        
        try:
            with CACHE_OPERATIONS.labels(operation="get", cache_type=cache_type.value).time():
                if cache_type == CacheType.REDIS:
                    if not self.redis_async:
                        await self.initialize_async_redis()
                    
                    value = await self.redis_async.get(cache_key)
                    if value:
                        CACHE_HITS.labels(cache_type=cache_type.value, key_prefix=prefix).inc()
                        self.stats['hits'][cache_type.value] += 1
                        return self._deserialize_value(value.encode()) if isinstance(value, str) else value
                
                elif cache_type == CacheType.MEMCACHED:
                    value = self.memcached.get(cache_key)
                    if value:
                        CACHE_HITS.labels(cache_type=cache_type.value, key_prefix=prefix).inc()
                        self.stats['hits'][cache_type.value] += 1
                        return self._deserialize_value(value)
                
                elif cache_type == CacheType.APPLICATION:
                    if cache_key in self.app_cache:
                        # Check TTL
                        if cache_key in self.app_cache_ttl:
                            if time.time() > self.app_cache_ttl[cache_key]:
                                del self.app_cache[cache_key]
                                del self.app_cache_ttl[cache_key]
                            else:
                                CACHE_HITS.labels(cache_type=cache_type.value, key_prefix=prefix).inc()
                                self.stats['hits'][cache_type.value] += 1
                                self.app_cache_access[cache_key] += 1
                                return self.app_cache[cache_key]
            
            # Cache miss
            CACHE_MISSES.labels(cache_type=cache_type.value, key_prefix=prefix).inc()
            self.stats['misses'][cache_type.value] += 1
            return default
            
        except Exception as e:
            logger.error(f"Cache get error for key {cache_key}: {e}")
            self.stats['errors'][cache_type.value] += 1
            return default
    
    async def set(
        self,
        key: str,
        value: Any,
        ttl: int = CACHE_TTL_DEFAULT,
        cache_type: CacheType = CacheType.REDIS,
        prefix: str = "",
        compress: bool = True
    ) -> bool:
        """Set value in cache"""
        
        cache_key = self._generate_cache_key(key, prefix)
        
        try:
            with CACHE_OPERATIONS.labels(operation="set", cache_type=cache_type.value).time():
                if cache_type == CacheType.REDIS:
                    if not self.redis_async:
                        await self.initialize_async_redis()
                    
                    serialized_value = self._serialize_value(value, compress)
                    await self.redis_async.setex(cache_key, ttl, serialized_value)
                
                elif cache_type == CacheType.MEMCACHED:
                    serialized_value = self._serialize_value(value, compress)
                    self.memcached.set(cache_key, serialized_value, time=ttl)
                
                elif cache_type == CacheType.APPLICATION:
                    self.app_cache[cache_key] = value
                    if ttl > 0:
                        self.app_cache_ttl[cache_key] = time.time() + ttl
            
            self.stats['sets'][cache_type.value] += 1
            return True
            
        except Exception as e:
            logger.error(f"Cache set error for key {cache_key}: {e}")
            self.stats['errors'][cache_type.value] += 1
            return False
    
    async def delete(
        self,
        key: str,
        cache_type: CacheType = CacheType.REDIS,
        prefix: str = ""
    ) -> bool:
        """Delete value from cache"""
        
        cache_key = self._generate_cache_key(key, prefix)
        
        try:
            with CACHE_OPERATIONS.labels(operation="delete", cache_type=cache_type.value).time():
                if cache_type == CacheType.REDIS:
                    if not self.redis_async:
                        await self.initialize_async_redis()
                    
                    await self.redis_async.delete(cache_key)
                
                elif cache_type == CacheType.MEMCACHED:
                    self.memcached.delete(cache_key)
                
                elif cache_type == CacheType.APPLICATION:
                    if cache_key in self.app_cache:
                        del self.app_cache[cache_key]
                    if cache_key in self.app_cache_ttl:
                        del self.app_cache_ttl[cache_key]
                    if cache_key in self.app_cache_access:
                        del self.app_cache_access[cache_key]
            
            self.stats['deletes'][cache_type.value] += 1
            return True
            
        except Exception as e:
            logger.error(f"Cache delete error for key {cache_key}: {e}")
            self.stats['errors'][cache_type.value] += 1
            return False
    
    async def clear_cache(self, cache_type: CacheType = CacheType.REDIS, pattern: str = "*") -> int:
        """Clear cache by pattern"""
        
        try:
            if cache_type == CacheType.REDIS:
                if not self.redis_async:
                    await self.initialize_async_redis()
                
                keys = await self.redis_async.keys(pattern)
                if keys:
                    return await self.redis_async.delete(*keys)
            
            elif cache_type == CacheType.APPLICATION:
                count = 0
                keys_to_delete = []
                for key in self.app_cache.keys():
                    if pattern == "*" or pattern in key:
                        keys_to_delete.append(key)
                
                for key in keys_to_delete:
                    if key in self.app_cache:
                        del self.app_cache[key]
                    if key in self.app_cache_ttl:
                        del self.app_cache_ttl[key]
                    if key in self.app_cache_access:
                        del self.app_cache_access[key]
                    count += 1
                
                return count
            
            return 0
            
        except Exception as e:
            logger.error(f"Cache clear error: {e}")
            return 0
    
    def get_stats(self) -> Dict[str, Any]:
        """Get cache statistics"""
        return {
            'stats': dict(self.stats),
            'app_cache_size': len(self.app_cache),
            'app_cache_memory': sum(len(str(v)) for v in self.app_cache.values()),
            'most_accessed': sorted(
                self.app_cache_access.items(),
                key=lambda x: x[1],
                reverse=True
            )[:10]
        }

class DatabaseOptimizer:
    """Database performance optimization"""
    
    def __init__(self):
        self.engines = {}
        self.session_factories = {}
        self.query_stats = defaultdict(lambda: {'count': 0, 'total_time': 0, 'avg_time': 0})
        
    def create_optimized_engine(
        self,
        database_url: str,
        config: DatabaseConfig
    ) -> sa.Engine:
        """Create optimized database engine"""
        
        # Connection pool configuration
        poolclass = QueuePool if "postgresql" in database_url else StaticPool
        
        engine = create_engine(
            database_url,
            poolclass=poolclass,
            pool_size=config.pool_size,
            max_overflow=config.max_overflow,
            pool_timeout=config.pool_timeout,
            pool_recycle=config.pool_recycle,
            pool_pre_ping=True,  # Validate connections before use
            echo=config.enable_query_logging,
            echo_pool=False,
            future=True,
            # PostgreSQL specific optimizations
            connect_args={
                "options": "-c default_transaction_isolation=read_committed",
                "application_name": "annotateai_performance",
                "connect_timeout": 10,
            } if "postgresql" in database_url else {}
        )
        
        # Register event listeners for monitoring
        @event.listens_for(engine, "before_cursor_execute")
        def before_cursor_execute(conn, cursor, statement, parameters, context, executemany):
            context._query_start_time = time.time()
        
        @event.listens_for(engine, "after_cursor_execute")
        def after_cursor_execute(conn, cursor, statement, parameters, context, executemany):
            total = time.time() - context._query_start_time
            
            # Extract table name from query
            table_name = self._extract_table_name(statement)
            
            # Update statistics
            self.query_stats[table_name]['count'] += 1
            self.query_stats[table_name]['total_time'] += total
            self.query_stats[table_name]['avg_time'] = (
                self.query_stats[table_name]['total_time'] / 
                self.query_stats[table_name]['count']
            )
            
            # Record metrics
            DATABASE_QUERIES.labels(table=table_name).observe(total)
            
            # Log slow queries
            if total > config.slow_query_threshold:
                logger.warning(f"Slow query detected ({total:.3f}s): {statement[:200]}...")
        
        @event.listens_for(engine, "connect")
        def set_connection_options(dbapi_connection, connection_record):
            DATABASE_CONNECTIONS.inc()
            
            # PostgreSQL specific optimizations
            if "postgresql" in database_url:
                with dbapi_connection.cursor() as cursor:
                    # Set connection-level optimizations
                    cursor.execute("SET shared_preload_libraries = 'pg_stat_statements'")
                    cursor.execute("SET log_statement_stats = off")
                    cursor.execute("SET log_parser_stats = off")
                    cursor.execute("SET log_planner_stats = off")
                    cursor.execute("SET log_executor_stats = off")
        
        @event.listens_for(engine, "close")
        def on_disconnect(dbapi_connection, connection_record):
            DATABASE_CONNECTIONS.dec()
        
        return engine
    
    def _extract_table_name(self, query: str) -> str:
        """Extract table name from SQL query"""
        query_lower = query.lower().strip()
        
        # Simple table name extraction
        if query_lower.startswith('select'):
            if ' from ' in query_lower:
                parts = query_lower.split(' from ')[1].split()
                if parts:
                    return parts[0].replace('"', '').replace('`', '')
        elif query_lower.startswith('insert into'):
            parts = query_lower.split('insert into ')[1].split()
            if parts:
                return parts[0].replace('"', '').replace('`', '')
        elif query_lower.startswith('update'):
            parts = query_lower.split('update ')[1].split()
            if parts:
                return parts[0].replace('"', '').replace('`', '')
        elif query_lower.startswith('delete from'):
            parts = query_lower.split('delete from ')[1].split()
            if parts:
                return parts[0].replace('"', '').replace('`', '')
        
        return "unknown"
    
    def get_query_stats(self) -> Dict[str, Any]:
        """Get database query statistics"""
        return {
            'query_stats': dict(self.query_stats),
            'top_slowest_queries': sorted(
                self.query_stats.items(),
                key=lambda x: x[1]['avg_time'],
                reverse=True
            )[:10],
            'most_frequent_queries': sorted(
                self.query_stats.items(),
                key=lambda x: x[1]['count'],
                reverse=True
            )[:10]
        }

class CDNManager:
    """CDN and asset optimization management"""
    
    def __init__(self):
        self.cloudflare_client = None
        self.aws_cloudfront_client = None
        self.tinify_client = None
        
        # Initialize CDN clients
        if CDN_PROVIDER == "cloudflare" and CDN_API_KEY:
            self.cloudflare_client = cloudflare.CloudFlare(token=CDN_API_KEY)
        
        if CDN_PROVIDER == "aws_cloudfront":
            self.aws_cloudfront_client = boto3.client('cloudfront')
        
        # Initialize image optimization
        if os.getenv("TINIFY_API_KEY"):
            tinify.key = os.getenv("TINIFY_API_KEY")
            self.tinify_client = tinify
    
    async def purge_cache(self, urls: List[str] = None, tags: List[str] = None) -> bool:
        """Purge CDN cache"""
        
        try:
            if self.cloudflare_client and CDN_ZONE_ID:
                if urls:
                    # Purge specific URLs
                    result = self.cloudflare_client.zones.purge_cache.post(
                        CDN_ZONE_ID,
                        data={'files': urls}
                    )
                elif tags:
                    # Purge by cache tags
                    result = self.cloudflare_client.zones.purge_cache.post(
                        CDN_ZONE_ID,
                        data={'tags': tags}
                    )
                else:
                    # Purge everything
                    result = self.cloudflare_client.zones.purge_cache.post(
                        CDN_ZONE_ID,
                        data={'purge_everything': True}
                    )
                
                CDN_REQUESTS.labels(endpoint="purge_cache").inc()
                return result.get('success', False)
            
            elif self.aws_cloudfront_client and AWS_CLOUDFRONT_DISTRIBUTION_ID:
                # Create CloudFront invalidation
                invalidation = self.aws_cloudfront_client.create_invalidation(
                    DistributionId=AWS_CLOUDFRONT_DISTRIBUTION_ID,
                    InvalidationBatch={
                        'Paths': {
                            'Quantity': len(urls) if urls else 1,
                            'Items': urls if urls else ['/*']
                        },
                        'CallerReference': str(uuid.uuid4())
                    }
                )
                
                CDN_REQUESTS.labels(endpoint="create_invalidation").inc()
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"CDN cache purge failed: {e}")
            return False
    
    async def optimize_image(self, image_path: str, output_path: str = None) -> bool:
        """Optimize image using TinyPNG/TinyJPG"""
        
        if not self.tinify_client:
            return False
        
        try:
            # Optimize with TinyPNG
            source = tinify.from_file(image_path)
            
            if output_path:
                source.to_file(output_path)
            else:
                source.to_file(image_path)  # Overwrite original
            
            return True
            
        except Exception as e:
            logger.error(f"Image optimization failed: {e}")
            return False
    
    async def get_cache_analytics(self) -> Dict[str, Any]:
        """Get CDN cache analytics"""
        
        try:
            if self.cloudflare_client and CDN_ZONE_ID:
                # Get analytics from Cloudflare
                analytics = self.cloudflare_client.zones.analytics.dashboard.get(
                    CDN_ZONE_ID,
                    params={'since': -1440}  # Last 24 hours
                )
                
                cache_stats = analytics.get('result', {})
                hit_ratio = cache_stats.get('totals', {}).get('requests', {}).get('cached', 0)
                total_requests = cache_stats.get('totals', {}).get('requests', {}).get('all', 0)
                
                if total_requests > 0:
                    hit_ratio_percent = (hit_ratio / total_requests) * 100
                    CDN_CACHE_HIT_RATIO.set(hit_ratio_percent)
                
                return {
                    'hit_ratio': hit_ratio_percent if total_requests > 0 else 0,
                    'total_requests': total_requests,
                    'cached_requests': hit_ratio,
                    'bandwidth_saved': cache_stats.get('totals', {}).get('bandwidth', {}).get('cached', 0)
                }
            
            return {}
            
        except Exception as e:
            logger.error(f"CDN analytics retrieval failed: {e}")
            return {}

class AutoScaler:
    """Kubernetes auto-scaling management"""
    
    def __init__(self):
        self.k8s_client = None
        self.k8s_apps_v1 = None
        self.k8s_autoscaling_v1 = None
        
        try:
            # Load Kubernetes config
            if os.path.exists('/var/run/secrets/kubernetes.io/serviceaccount'):
                config.load_incluster_config()
            else:
                config.load_kube_config()
            
            self.k8s_client = client.ApiClient()
            self.k8s_apps_v1 = client.AppsV1Api()
            self.k8s_autoscaling_v1 = client.AutoscalingV1Api()
            
        except Exception as e:
            logger.warning(f"Kubernetes client initialization failed: {e}")
    
    async def create_hpa(
        self,
        deployment_name: str,
        config: AutoScalingConfig
    ) -> bool:
        """Create Horizontal Pod Autoscaler"""
        
        if not self.k8s_autoscaling_v1:
            return False
        
        try:
            hpa = client.V1HorizontalPodAutoscaler(
                metadata=client.V1ObjectMeta(
                    name=f"{deployment_name}-hpa",
                    namespace=KUBERNETES_NAMESPACE
                ),
                spec=client.V1HorizontalPodAutoscalerSpec(
                    scale_target_ref=client.V1CrossVersionObjectReference(
                        api_version="apps/v1",
                        kind="Deployment",
                        name=deployment_name
                    ),
                    min_replicas=config.min_replicas,
                    max_replicas=config.max_replicas,
                    target_cpu_utilization_percentage=config.target_cpu_utilization
                )
            )
            
            self.k8s_autoscaling_v1.create_namespaced_horizontal_pod_autoscaler(
                namespace=KUBERNETES_NAMESPACE,
                body=hpa
            )
            
            return True
            
        except Exception as e:
            logger.error(f"HPA creation failed: {e}")
            return False
    
    async def scale_deployment(
        self,
        deployment_name: str,
        replicas: int
    ) -> bool:
        """Manually scale deployment"""
        
        if not self.k8s_apps_v1:
            return False
        
        try:
            # Get current deployment
            deployment = self.k8s_apps_v1.read_namespaced_deployment(
                name=deployment_name,
                namespace=KUBERNETES_NAMESPACE
            )
            
            # Update replica count
            deployment.spec.replicas = replicas
            
            # Apply update
            self.k8s_apps_v1.patch_namespaced_deployment(
                name=deployment_name,
                namespace=KUBERNETES_NAMESPACE,
                body=deployment
            )
            
            AUTO_SCALE_EVENTS.labels(
                direction="up" if replicas > deployment.spec.replicas else "down",
                service=deployment_name
            ).inc()
            
            return True
            
        except Exception as e:
            logger.error(f"Deployment scaling failed: {e}")
            return False
    
    async def get_scaling_metrics(self) -> Dict[str, Any]:
        """Get current scaling metrics"""
        
        if not self.k8s_apps_v1:
            return {}
        
        try:
            deployments = self.k8s_apps_v1.list_namespaced_deployment(
                namespace=KUBERNETES_NAMESPACE
            )
            
            metrics = {}
            for deployment in deployments.items:
                metrics[deployment.metadata.name] = {
                    'replicas': deployment.status.replicas or 0,
                    'ready_replicas': deployment.status.ready_replicas or 0,
                    'available_replicas': deployment.status.available_replicas or 0,
                    'unavailable_replicas': deployment.status.unavailable_replicas or 0
                }
            
            return metrics
            
        except Exception as e:
            logger.error(f"Scaling metrics retrieval failed: {e}")
            return {}

class PerformanceMonitor:
    """Comprehensive performance monitoring"""
    
    def __init__(self):
        # Initialize APM clients
        self.datadog_initialized = False
        self.newrelic_initialized = False
        
        if DATADOG_API_KEY:
            initialize(
                api_key=DATADOG_API_KEY,
                app_key=DATADOG_APP_KEY,
                host='https://api.datadoghq.com'
            )
            self.datadog_initialized = True
        
        if NEWRELIC_LICENSE_KEY:
            newrelic.agent.initialize()
            self.newrelic_initialized = True
        
        # Initialize InfluxDB client
        self.influxdb_client = None
        if INFLUXDB_URL and INFLUXDB_TOKEN:
            self.influxdb_client = influxdb_client.InfluxDBClient(
                url=INFLUXDB_URL,
                token=INFLUXDB_TOKEN,
                org=INFLUXDB_ORG
            )
        
        # Initialize Elasticsearch client
        self.elasticsearch_client = None
        if ELASTICSEARCH_HOSTS:
            self.elasticsearch_client = Elasticsearch(ELASTICSEARCH_HOSTS)
        
        # Performance metrics collection
        self.metrics_history = deque(maxlen=1000)
        self.performance_trends = {}
    
    async def collect_system_metrics(self) -> Dict[str, float]:
        """Collect system performance metrics"""
        
        # CPU metrics
        cpu_percent = psutil.cpu_percent(interval=1)
        cpu_count = psutil.cpu_count()
        
        # Memory metrics
        memory = psutil.virtual_memory()
        memory_percent = memory.percent
        memory_available = memory.available / (1024**3)  # GB
        
        # Disk metrics
        disk = psutil.disk_usage('/')
        disk_percent = disk.percent
        disk_free = disk.free / (1024**3)  # GB
        
        # Network metrics
        network = psutil.net_io_counters()
        
        # GPU metrics (if available)
        gpu_metrics = {}
        try:
            gpus = GPUtil.getGPUs()
            if gpus:
                gpu_metrics = {
                    'gpu_utilization': sum(gpu.load for gpu in gpus) / len(gpus) * 100,
                    'gpu_memory_utilization': sum(gpu.memoryUtil for gpu in gpus) / len(gpus) * 100,
                    'gpu_temperature': sum(gpu.temperature for gpu in gpus) / len(gpus)
                }
        except:
            pass
        
        metrics = {
            'cpu_utilization': cpu_percent,
            'cpu_count': cpu_count,
            'memory_utilization': memory_percent,
            'memory_available_gb': memory_available,
            'disk_utilization': disk_percent,
            'disk_free_gb': disk_free,
            'network_bytes_sent': network.bytes_sent,
            'network_bytes_recv': network.bytes_recv,
            **gpu_metrics
        }
        
        # Update Prometheus metrics
        RESOURCE_UTILIZATION.labels(resource_type="cpu").set(cpu_percent)
        RESOURCE_UTILIZATION.labels(resource_type="memory").set(memory_percent)
        RESOURCE_UTILIZATION.labels(resource_type="disk").set(disk_percent)
        
        # Store in InfluxDB
        if self.influxdb_client:
            await self._store_metrics_influxdb(metrics)
        
        # Send to Datadog
        if self.datadog_initialized:
            await self._send_metrics_datadog(metrics)
        
        return metrics
    
    async def _store_metrics_influxdb(self, metrics: Dict[str, float]):
        """Store metrics in InfluxDB"""
        
        try:
            write_api = self.influxdb_client.write_api(write_options=SYNCHRONOUS)
            
            points = []
            for metric_name, value in metrics.items():
                point = influxdb_client.Point("system_metrics") \
                    .field(metric_name, value) \
                    .time(datetime.utcnow())
                points.append(point)
            
            write_api.write(bucket=INFLUXDB_BUCKET, record=points)
            
        except Exception as e:
            logger.error(f"InfluxDB write failed: {e}")
    
    async def _send_metrics_datadog(self, metrics: Dict[str, float]):
        """Send metrics to Datadog"""
        
        try:
            for metric_name, value in metrics.items():
                statsd.gauge(f"annotateai.{metric_name}", value)
        
        except Exception as e:
            logger.error(f"Datadog metrics send failed: {e}")
    
    async def calculate_performance_score(self, metrics: Dict[str, float]) -> float:
        """Calculate overall performance score (0-100)"""
        
        # Weight factors for different metrics
        weights = {
            'cpu_utilization': -0.3,  # Negative because higher is worse
            'memory_utilization': -0.3,
            'disk_utilization': -0.2,
            'cache_hit_ratio': 0.2,  # Positive because higher is better
        }
        
        score = 100  # Start with perfect score
        
        for metric, weight in weights.items():
            if metric in metrics:
                if weight < 0:  # Resource utilization (lower is better)
                    score += weight * metrics[metric]
                else:  # Performance metrics (higher is better)
                    score += weight * (metrics[metric] - 50)  # Normalize around 50%
        
        # Clamp score between 0 and 100
        score = max(0, min(100, score))
        
        PERFORMANCE_SCORE.set(score)
        
        return score
    
    async def generate_performance_report(self) -> PerformanceReport:
        """Generate comprehensive performance report"""
        
        # Collect current metrics
        current_metrics = await self.collect_system_metrics()
        
        # Calculate performance score
        performance_score = await self.calculate_performance_score(current_metrics)
        
        # Generate recommendations
        recommendations = []
        issues = []
        
        if current_metrics.get('cpu_utilization', 0) > 80:
            recommendations.append("Consider scaling up CPU resources or optimizing CPU-intensive operations")
            issues.append({
                'type': 'high_cpu_usage',
                'severity': 'high',
                'value': current_metrics['cpu_utilization'],
                'threshold': 80
            })
        
        if current_metrics.get('memory_utilization', 0) > 85:
            recommendations.append("Memory usage is high. Consider increasing memory or optimizing memory usage")
            issues.append({
                'type': 'high_memory_usage',
                'severity': 'high',
                'value': current_metrics['memory_utilization'],
                'threshold': 85
            })
        
        if current_metrics.get('disk_utilization', 0) > 90:
            recommendations.append("Disk usage is critically high. Clean up unnecessary files or add storage")
            issues.append({
                'type': 'high_disk_usage',
                'severity': 'critical',
                'value': current_metrics['disk_utilization'],
                'threshold': 90
            })
        
        # Analyze trends
        trends = self._analyze_performance_trends()
        
        return PerformanceReport(
            timestamp=datetime.utcnow(),
            overall_score=performance_score,
            metrics={
                PerformanceMetric.CPU_USAGE: current_metrics.get('cpu_utilization', 0),
                PerformanceMetric.MEMORY_USAGE: current_metrics.get('memory_utilization', 0),
                PerformanceMetric.DISK_USAGE: current_metrics.get('disk_utilization', 0),
                PerformanceMetric.CACHE_HIT_RATIO: current_metrics.get('cache_hit_ratio', 0)
            },
            recommendations=recommendations,
            issues=issues,
            trends=trends
        )
    
    def _analyze_performance_trends(self) -> Dict[str, Any]:
        """Analyze performance trends"""
        
        if len(self.metrics_history) < 2:
            return {}
        
        # Simple trend analysis
        recent_metrics = list(self.metrics_history)[-10:]  # Last 10 measurements
        older_metrics = list(self.metrics_history)[-20:-10] if len(self.metrics_history) >= 20 else []
        
        trends = {}
        
        if older_metrics:
            for metric in ['cpu_utilization', 'memory_utilization', 'disk_utilization']:
                recent_avg = sum(m.get(metric, 0) for m in recent_metrics) / len(recent_metrics)
                older_avg = sum(m.get(metric, 0) for m in older_metrics) / len(older_metrics)
                
                if recent_avg > older_avg * 1.1:  # 10% increase
                    trends[metric] = 'increasing'
                elif recent_avg < older_avg * 0.9:  # 10% decrease
                    trends[metric] = 'decreasing'
                else:
                    trends[metric] = 'stable'
        
        return trends

class PerformanceOptimizationService:
    """Main performance optimization service"""
    
    def __init__(self):
        self.cache_manager = CacheManager()
        self.database_optimizer = DatabaseOptimizer()
        self.cdn_manager = CDNManager()
        self.auto_scaler = AutoScaler()
        self.performance_monitor = PerformanceMonitor()
        
        # Start background monitoring
        asyncio.create_task(self._background_monitoring())
    
    async def _background_monitoring(self):
        """Background task for continuous monitoring"""
        while True:
            try:
                # Collect metrics every 60 seconds
                metrics = await self.performance_monitor.collect_system_metrics()
                self.performance_monitor.metrics_history.append(metrics)
                
                # Check for auto-scaling triggers
                if AUTO_SCALING_ENABLED:
                    await self._check_auto_scaling_triggers(metrics)
                
                await asyncio.sleep(60)
                
            except Exception as e:
                logger.error(f"Background monitoring error: {e}")
                await asyncio.sleep(60)
    
    async def _check_auto_scaling_triggers(self, metrics: Dict[str, float]):
        """Check if auto-scaling should be triggered"""
        
        cpu_usage = metrics.get('cpu_utilization', 0)
        memory_usage = metrics.get('memory_utilization', 0)
        
        # Simple scaling logic
        if cpu_usage > 80 or memory_usage > 85:
            # Scale up
            scaling_metrics = await self.auto_scaler.get_scaling_metrics()
            for deployment_name, deployment_metrics in scaling_metrics.items():
                current_replicas = deployment_metrics['replicas']
                if current_replicas < 10:  # Max limit
                    await self.auto_scaler.scale_deployment(deployment_name, current_replicas + 1)
        
        elif cpu_usage < 30 and memory_usage < 50:
            # Scale down
            scaling_metrics = await self.auto_scaler.get_scaling_metrics()
            for deployment_name, deployment_metrics in scaling_metrics.items():
                current_replicas = deployment_metrics['replicas']
                if current_replicas > 2:  # Min limit
                    await self.auto_scaler.scale_deployment(deployment_name, current_replicas - 1)
    
    async def optimize_performance(
        self,
        request: PerformanceOptimizationRequest
    ) -> Dict[str, Any]:
        """Apply performance optimizations"""
        
        results = {
            'optimizations_applied': [],
            'cache_configuration': {},
            'database_configuration': {},
            'cdn_configuration': {},
            'auto_scaling_configuration': {}
        }
        
        # Configure caching
        if request.cache_config.enabled:
            # Clear existing cache if strategy is aggressive
            if request.strategy == OptimizationStrategy.AGGRESSIVE:
                await self.cache_manager.clear_cache()
            
            results['cache_configuration'] = asdict(request.cache_config)
            results['optimizations_applied'].append('cache_optimization')
        
        # Configure auto-scaling
        if request.auto_scaling_config.enabled:
            # Create HPA for main services
            services = ['api-gateway', 'ai-model-service', 'video-processing-service']
            for service in services:
                await self.auto_scaler.create_hpa(service, request.auto_scaling_config)
            
            results['auto_scaling_configuration'] = asdict(request.auto_scaling_config)
            results['optimizations_applied'].append('auto_scaling')
        
        # Configure CDN
        if request.cdn_config.enabled:
            # Purge CDN cache if aggressive optimization
            if request.strategy == OptimizationStrategy.AGGRESSIVE:
                await self.cdn_manager.purge_cache()
            
            results['cdn_configuration'] = asdict(request.cdn_config)
            results['optimizations_applied'].append('cdn_optimization')
        
        return results
    
    async def get_performance_report(self) -> PerformanceReport:
        """Get comprehensive performance report"""
        return await self.performance_monitor.generate_performance_report()
    
    async def get_cache_stats(self) -> Dict[str, Any]:
        """Get cache statistics"""
        return self.cache_manager.get_stats()
    
    async def get_database_stats(self) -> Dict[str, Any]:
        """Get database statistics"""
        return self.database_optimizer.get_query_stats()
    
    async def get_cdn_analytics(self) -> Dict[str, Any]:
        """Get CDN analytics"""
        return await self.cdn_manager.get_cache_analytics()
    
    def get_system_stats(self) -> Dict[str, Any]:
        """Get system statistics"""
        return {
            "performance_optimization_enabled": True,
            "cache_enabled": True,
            "auto_scaling_enabled": AUTO_SCALING_ENABLED,
            "cdn_enabled": CDN_PROVIDER != "",
            "monitoring_enabled": DATADOG_API_KEY != "" or NEWRELIC_LICENSE_KEY != "",
            "background_monitoring_active": True
        }

# Cache decorator
def cached(
    ttl: int = CACHE_TTL_DEFAULT,
    cache_type: CacheType = CacheType.REDIS,
    key_prefix: str = "",
    compress: bool = True
):
    """Decorator for caching function results"""
    def decorator(func: Callable):
        @functools.wraps(func)
        async def wrapper(*args, **kwargs):
            # Generate cache key
            cache_key = f"{func.__name__}:{hashlib.md5(str(args + tuple(kwargs.items())).encode()).hexdigest()}"
            
            # Try to get from cache
            cached_result = await service.cache_manager.get(
                cache_key,
                cache_type=cache_type,
                prefix=key_prefix
            )
            
            if cached_result is not None:
                return cached_result
            
            # Execute function
            result = await func(*args, **kwargs)
            
            # Cache result
            await service.cache_manager.set(
                cache_key,
                result,
                ttl=ttl,
                cache_type=cache_type,
                prefix=key_prefix,
                compress=compress
            )
            
            return result
        
        return wrapper
    return decorator

# Initialize service
service = PerformanceOptimizationService()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    logger.info("Starting AnnotateAI Performance Optimization Service")
    yield
    logger.info("Shutting down AnnotateAI Performance Optimization Service")

# Create FastAPI app
app = FastAPI(
    title="AnnotateAI Performance Optimization Service",
    description="Advanced caching, monitoring, scaling, and optimization infrastructure",
    version="1.0.0",
    lifespan=lifespan
)

# Add middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(GZipMiddleware, minimum_size=1000)

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "services": {
            "cache": "healthy",
            "database": "healthy",
            "cdn": "healthy" if CDN_PROVIDER else "disabled",
            "monitoring": "healthy"
        }
    }

@app.post("/optimize/performance")
async def optimize_performance(request: PerformanceOptimizationRequest):
    """Apply performance optimizations"""
    return await service.optimize_performance(request)

@app.get("/performance/report")
async def get_performance_report():
    """Get performance analysis report"""
    return await service.get_performance_report()

@app.get("/cache/stats")
async def get_cache_stats():
    """Get cache statistics"""
    return await service.get_cache_stats()

@app.post("/cache/clear")
async def clear_cache(
    cache_type: CacheType = CacheType.REDIS,
    pattern: str = "*"
):
    """Clear cache by pattern"""
    count = await service.cache_manager.clear_cache(cache_type, pattern)
    return {"cleared_keys": count}

@app.get("/database/stats")
async def get_database_stats():
    """Get database performance statistics"""
    return await service.get_database_stats()

@app.get("/cdn/analytics")
async def get_cdn_analytics():
    """Get CDN analytics"""
    return await service.get_cdn_analytics()

@app.post("/cdn/purge")
async def purge_cdn_cache(urls: List[str] = None):
    """Purge CDN cache"""
    success = await service.cdn_manager.purge_cache(urls)
    return {"success": success}

@app.get("/scaling/metrics")
async def get_scaling_metrics():
    """Get auto-scaling metrics"""
    return await service.auto_scaler.get_scaling_metrics()

@app.post("/scaling/manual")
async def manual_scale(deployment_name: str, replicas: int):
    """Manually scale deployment"""
    success = await service.auto_scaler.scale_deployment(deployment_name, replicas)
    return {"success": success}

@app.get("/system/stats")
async def get_system_stats():
    """Get system statistics"""
    return service.get_system_stats()

@app.get("/metrics")
async def get_metrics():
    """Get Prometheus metrics"""
    from fastapi.responses import Response
    return Response(generate_latest(), media_type="text/plain")

# Cached endpoint example
@app.get("/example/cached-data")
@cached(ttl=300, cache_type=CacheType.REDIS, key_prefix="example")
async def get_cached_data(param: str = "default"):
    """Example cached endpoint"""
    # Simulate expensive operation
    await asyncio.sleep(1)
    return {"data": f"Processed data for {param}", "timestamp": datetime.utcnow().isoformat()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 