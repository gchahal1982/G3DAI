#!/usr/bin/env python3
"""
AnnotateAI Training Service
Distributed training system with MLOps pipeline for model training and deployment
"""

import asyncio
import logging
import os
import time
import json
import yaml
import shutil
from pathlib import Path
from typing import Dict, List, Optional, Any, Union
from datetime import datetime, timedelta
from contextlib import asynccontextmanager
from dataclasses import dataclass, field
from enum import Enum
import uuid

import torch
import torch.nn as nn
import torch.distributed as dist
import torch.multiprocessing as mp
from torch.nn.parallel import DistributedDataParallel as DDP
from torch.utils.data import DataLoader, DistributedSampler
from torch.utils.tensorboard import SummaryWriter
import torch.optim as optim
from torch.optim.lr_scheduler import CosineAnnealingLR, StepLR, ReduceLROnPlateau

import numpy as np
import pandas as pd
from PIL import Image
import cv2
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
import matplotlib.pyplot as plt
import seaborn as sns

# FastAPI and web framework
from fastapi import FastAPI, HTTPException, BackgroundTasks, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from pydantic import BaseModel, Field

# MLflow for experiment tracking
import mlflow
import mlflow.pytorch
from mlflow.tracking import MlflowClient

# Ray for distributed training
import ray
from ray import train, tune
from ray.train import ScalingConfig
from ray.tune.schedulers import ASHAScheduler
from ray.tune.search.optuna import OptunaSearch

# Optuna for hyperparameter optimization
import optuna
from optuna.integration import PyTorchLightningPruningCallback

# Redis for job queue
import redis
from rq import Queue, Worker

# Database
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Text, Float, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.dialects.postgresql import UUID, JSONB

# Monitoring
from prometheus_client import Counter, Histogram, Gauge, generate_latest
import psutil

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Environment configuration
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
MLFLOW_TRACKING_URI = os.getenv("MLFLOW_TRACKING_URI", "http://localhost:5000")
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost/annotateai")
MODEL_REGISTRY_PATH = os.getenv("MODEL_REGISTRY_PATH", "/app/models")
EXPERIMENT_DATA_PATH = os.getenv("EXPERIMENT_DATA_PATH", "/app/experiments")

# Prometheus metrics
TRAINING_JOBS_TOTAL = Counter('training_jobs_total', 'Total training jobs', ['status'])
TRAINING_DURATION = Histogram('training_duration_seconds', 'Training duration', ['model_type'])
ACTIVE_TRAINING_JOBS = Gauge('active_training_jobs', 'Active training jobs')
MODEL_ACCURACY = Gauge('model_accuracy', 'Model accuracy', ['model_id', 'dataset'])
TRAINING_LOSS = Gauge('training_loss', 'Training loss', ['model_id', 'epoch'])

# Database models
Base = declarative_base()

class TrainingJob(Base):
    __tablename__ = "training_jobs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    model_type = Column(String(100), nullable=False)
    dataset_path = Column(String(512), nullable=False)
    config = Column(JSONB, nullable=False)
    status = Column(String(50), default="pending")
    start_time = Column(DateTime, nullable=True)
    end_time = Column(DateTime, nullable=True)
    metrics = Column(JSONB, nullable=True)
    model_path = Column(String(512), nullable=True)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class ExperimentRun(Base):
    __tablename__ = "experiment_runs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    experiment_name = Column(String(255), nullable=False)
    run_name = Column(String(255), nullable=False)
    parameters = Column(JSONB, nullable=False)
    metrics = Column(JSONB, nullable=True)
    artifacts = Column(JSONB, nullable=True)
    status = Column(String(50), default="running")
    start_time = Column(DateTime, default=datetime.utcnow)
    end_time = Column(DateTime, nullable=True)
    mlflow_run_id = Column(String(255), nullable=True)

class ModelVersion(Base):
    __tablename__ = "model_versions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    model_name = Column(String(255), nullable=False)
    version = Column(String(50), nullable=False)
    model_path = Column(String(512), nullable=False)
    training_job_id = Column(UUID(as_uuid=True), nullable=True)
    metrics = Column(JSONB, nullable=True)
    metadata = Column(JSONB, nullable=True)
    status = Column(String(50), default="staging")
    created_at = Column(DateTime, default=datetime.utcnow)
    is_production = Column(Boolean, default=False)

# Pydantic models
class TrainingConfig(BaseModel):
    """Training configuration"""
    model_type: str = Field(..., description="Type of model to train")
    dataset_path: str = Field(..., description="Path to training dataset")
    
    # Model parameters
    model_config: Dict[str, Any] = Field(default={}, description="Model configuration")
    
    # Training parameters
    batch_size: int = Field(default=32, ge=1, le=512, description="Batch size")
    learning_rate: float = Field(default=0.001, ge=1e-6, le=1.0, description="Learning rate")
    num_epochs: int = Field(default=100, ge=1, le=1000, description="Number of epochs")
    weight_decay: float = Field(default=1e-4, ge=0.0, le=1.0, description="Weight decay")
    optimizer: str = Field(default="adam", description="Optimizer type")
    scheduler: str = Field(default="cosine", description="Learning rate scheduler")
    
    # Data augmentation
    augmentation_config: Dict[str, Any] = Field(default={}, description="Data augmentation config")
    
    # Validation
    validation_split: float = Field(default=0.2, ge=0.0, le=0.5, description="Validation split")
    validation_frequency: int = Field(default=5, ge=1, le=100, description="Validation frequency")
    
    # Regularization
    dropout_rate: float = Field(default=0.1, ge=0.0, le=0.9, description="Dropout rate")
    early_stopping_patience: int = Field(default=10, ge=1, le=100, description="Early stopping patience")
    
    # Distributed training
    use_distributed: bool = Field(default=False, description="Use distributed training")
    num_workers: int = Field(default=1, ge=1, le=16, description="Number of workers")
    
    # Mixed precision
    use_mixed_precision: bool = Field(default=True, description="Use mixed precision training")
    
    # Checkpointing
    save_frequency: int = Field(default=10, ge=1, le=100, description="Checkpoint save frequency")
    max_checkpoints: int = Field(default=5, ge=1, le=20, description="Maximum checkpoints to keep")
    
    # Monitoring
    log_frequency: int = Field(default=10, ge=1, le=1000, description="Logging frequency")
    
    # Experiment tracking
    experiment_name: str = Field(default="default", description="Experiment name")
    run_name: Optional[str] = Field(default=None, description="Run name")
    tags: Dict[str, str] = Field(default={}, description="Experiment tags")

class HyperparameterConfig(BaseModel):
    """Hyperparameter optimization configuration"""
    search_space: Dict[str, Any] = Field(..., description="Search space definition")
    optimization_metric: str = Field(default="validation_loss", description="Metric to optimize")
    optimization_direction: str = Field(default="minimize", description="Optimization direction")
    num_trials: int = Field(default=20, ge=1, le=1000, description="Number of trials")
    timeout: int = Field(default=3600, ge=60, le=86400, description="Timeout in seconds")
    pruning_enabled: bool = Field(default=True, description="Enable pruning")
    concurrent_trials: int = Field(default=4, ge=1, le=16, description="Concurrent trials")

class TrainingJobRequest(BaseModel):
    """Training job request"""
    name: str = Field(..., description="Job name")
    config: TrainingConfig = Field(..., description="Training configuration")
    priority: int = Field(default=1, ge=1, le=10, description="Job priority")
    async_execution: bool = Field(default=True, description="Asynchronous execution")

class TrainingJobResponse(BaseModel):
    """Training job response"""
    job_id: str = Field(..., description="Job ID")
    status: str = Field(..., description="Job status")
    name: str = Field(..., description="Job name")
    created_at: datetime = Field(..., description="Creation time")
    start_time: Optional[datetime] = Field(default=None, description="Start time")
    end_time: Optional[datetime] = Field(default=None, description="End time")
    metrics: Optional[Dict[str, Any]] = Field(default=None, description="Training metrics")
    error_message: Optional[str] = Field(default=None, description="Error message")

class TrainingService:
    """Main training service"""
    
    def __init__(self):
        self.redis_client = redis.from_url(REDIS_URL)
        self.job_queue = Queue(connection=self.redis_client)
        self.active_jobs = {}
        self.model_registry = {}
        
        # Initialize database
        self.engine = create_engine(DATABASE_URL)
        Base.metadata.create_all(self.engine)
        self.SessionLocal = sessionmaker(bind=self.engine)
        
        # Initialize MLflow
        mlflow.set_tracking_uri(MLFLOW_TRACKING_URI)
        self.mlflow_client = MlflowClient()
        
        # Initialize Ray
        if not ray.is_initialized():
            ray.init()
    
    async def create_training_job(
        self,
        request: TrainingJobRequest,
        background_tasks: BackgroundTasks
    ) -> TrainingJobResponse:
        """Create a new training job"""
        
        job_id = str(uuid.uuid4())
        
        # Create database record
        with self.SessionLocal() as db:
            db_job = TrainingJob(
                id=job_id,
                name=request.name,
                model_type=request.config.model_type,
                dataset_path=request.config.dataset_path,
                config=request.config.dict(),
                status="pending"
            )
            db.add(db_job)
            db.commit()
            db.refresh(db_job)
        
        # Queue job for execution
        if request.async_execution:
            background_tasks.add_task(self._execute_training_job, job_id)
        else:
            await self._execute_training_job(job_id)
        
        return TrainingJobResponse(
            job_id=job_id,
            status="pending",
            name=request.name,
            created_at=datetime.utcnow()
        )
    
    async def _execute_training_job(self, job_id: str):
        """Execute a training job"""
        
        logger.info(f"Starting training job {job_id}")
        
        try:
            ACTIVE_TRAINING_JOBS.inc()
            TRAINING_JOBS_TOTAL.labels(status="started").inc()
            
            # Load job from database
            with self.SessionLocal() as db:
                db_job = db.query(TrainingJob).filter(TrainingJob.id == job_id).first()
                if not db_job:
                    raise ValueError(f"Job {job_id} not found")
                
                # Update status
                db_job.status = "running"
                db_job.start_time = datetime.utcnow()
                db.commit()
            
            # Parse configuration
            config = TrainingConfig(**db_job.config)
            
            # Create experiment directory
            experiment_dir = Path(EXPERIMENT_DATA_PATH) / job_id
            experiment_dir.mkdir(parents=True, exist_ok=True)
            
            # Initialize MLflow experiment
            experiment_name = config.experiment_name
            experiment = mlflow.get_experiment_by_name(experiment_name)
            if experiment is None:
                experiment_id = mlflow.create_experiment(experiment_name)
            else:
                experiment_id = experiment.experiment_id
            
            # Start MLflow run
            with mlflow.start_run(experiment_id=experiment_id, run_name=config.run_name or f"run_{job_id}") as run:
                # Log parameters
                mlflow.log_params(config.dict())
                
                # Execute training
                if config.use_distributed:
                    training_result = await self._execute_distributed_training(config, experiment_dir)
                else:
                    training_result = await self._execute_single_node_training(config, experiment_dir)
                
                # Log metrics
                for key, value in training_result["metrics"].items():
                    mlflow.log_metric(key, value)
                
                # Log artifacts
                mlflow.log_artifacts(str(experiment_dir))
                
                # Save model
                if training_result["model_path"]:
                    mlflow.pytorch.log_model(
                        pytorch_model=training_result["model"],
                        artifact_path="model",
                        registered_model_name=f"{config.model_type}_{job_id}"
                    )
            
            # Update job status
            with self.SessionLocal() as db:
                db_job = db.query(TrainingJob).filter(TrainingJob.id == job_id).first()
                db_job.status = "completed"
                db_job.end_time = datetime.utcnow()
                db_job.metrics = training_result["metrics"]
                db_job.model_path = training_result["model_path"]
                db.commit()
            
            TRAINING_JOBS_TOTAL.labels(status="completed").inc()
            logger.info(f"Training job {job_id} completed successfully")
            
        except Exception as e:
            logger.error(f"Training job {job_id} failed: {e}")
            
            # Update job status
            with self.SessionLocal() as db:
                db_job = db.query(TrainingJob).filter(TrainingJob.id == job_id).first()
                if db_job:
                    db_job.status = "failed"
                    db_job.end_time = datetime.utcnow()
                    db_job.error_message = str(e)
                    db.commit()
            
            TRAINING_JOBS_TOTAL.labels(status="failed").inc()
            
        finally:
            ACTIVE_TRAINING_JOBS.dec()
            if job_id in self.active_jobs:
                del self.active_jobs[job_id]
    
    async def _execute_single_node_training(
        self,
        config: TrainingConfig,
        experiment_dir: Path
    ) -> Dict[str, Any]:
        """Execute single-node training"""
        
        logger.info("Starting single-node training")
        
        # Load dataset
        train_loader, val_loader = await self._prepare_data_loaders(config)
        
        # Initialize model
        model = await self._initialize_model(config)
        model = model.to(DEVICE)
        
        # Initialize optimizer
        optimizer = self._get_optimizer(model, config)
        
        # Initialize scheduler
        scheduler = self._get_scheduler(optimizer, config)
        
        # Initialize loss function
        criterion = self._get_loss_function(config)
        
        # Training loop
        best_val_loss = float('inf')
        patience_counter = 0
        
        train_losses = []
        val_losses = []
        train_accuracies = []
        val_accuracies = []
        
        for epoch in range(config.num_epochs):
            # Training phase
            train_loss, train_acc = await self._train_epoch(
                model, train_loader, optimizer, criterion, epoch, config
            )
            
            train_losses.append(train_loss)
            train_accuracies.append(train_acc)
            
            # Validation phase
            if epoch % config.validation_frequency == 0:
                val_loss, val_acc = await self._validate_epoch(
                    model, val_loader, criterion, epoch, config
                )
                
                val_losses.append(val_loss)
                val_accuracies.append(val_acc)
                
                # Update metrics
                TRAINING_LOSS.labels(model_id=config.model_type, epoch=epoch).set(train_loss)
                MODEL_ACCURACY.labels(model_id=config.model_type, dataset="validation").set(val_acc)
                
                # Early stopping
                if val_loss < best_val_loss:
                    best_val_loss = val_loss
                    patience_counter = 0
                    
                    # Save best model
                    best_model_path = experiment_dir / "best_model.pth"
                    torch.save({
                        'epoch': epoch,
                        'model_state_dict': model.state_dict(),
                        'optimizer_state_dict': optimizer.state_dict(),
                        'loss': val_loss,
                        'accuracy': val_acc
                    }, best_model_path)
                    
                else:
                    patience_counter += 1
                    
                    if patience_counter >= config.early_stopping_patience:
                        logger.info(f"Early stopping at epoch {epoch}")
                        break
            
            # Learning rate scheduling
            if scheduler:
                if isinstance(scheduler, ReduceLROnPlateau):
                    scheduler.step(val_loss if val_losses else train_loss)
                else:
                    scheduler.step()
            
            # Save checkpoint
            if epoch % config.save_frequency == 0:
                checkpoint_path = experiment_dir / f"checkpoint_epoch_{epoch}.pth"
                torch.save({
                    'epoch': epoch,
                    'model_state_dict': model.state_dict(),
                    'optimizer_state_dict': optimizer.state_dict(),
                    'loss': train_loss,
                    'accuracy': train_acc
                }, checkpoint_path)
        
        # Final metrics
        final_metrics = {
            'final_train_loss': train_losses[-1] if train_losses else 0,
            'final_val_loss': val_losses[-1] if val_losses else 0,
            'final_train_accuracy': train_accuracies[-1] if train_accuracies else 0,
            'final_val_accuracy': val_accuracies[-1] if val_accuracies else 0,
            'best_val_loss': best_val_loss,
            'total_epochs': len(train_losses)
        }
        
        return {
            'model': model,
            'model_path': str(experiment_dir / "best_model.pth"),
            'metrics': final_metrics,
            'training_history': {
                'train_losses': train_losses,
                'val_losses': val_losses,
                'train_accuracies': train_accuracies,
                'val_accuracies': val_accuracies
            }
        }
    
    async def _execute_distributed_training(
        self,
        config: TrainingConfig,
        experiment_dir: Path
    ) -> Dict[str, Any]:
        """Execute distributed training using Ray"""
        
        logger.info("Starting distributed training")
        
        # Ray Train configuration
        train_config = {
            "config": config.dict(),
            "experiment_dir": str(experiment_dir)
        }
        
        scaling_config = ScalingConfig(
            num_workers=config.num_workers,
            use_gpu=torch.cuda.is_available()
        )
        
        # Define training function
        def train_func(config_dict):
            return self._ray_train_worker(config_dict)
        
        # Run distributed training
        result = train.run(
            train_func,
            config=train_config,
            scaling_config=scaling_config
        )
        
        return result
    
    def _ray_train_worker(self, config_dict: Dict[str, Any]) -> Dict[str, Any]:
        """Ray training worker function"""
        
        config = TrainingConfig(**config_dict["config"])
        experiment_dir = Path(config_dict["experiment_dir"])
        
        # Initialize distributed training
        train.init()
        
        # Load dataset
        train_loader, val_loader = asyncio.run(self._prepare_data_loaders(config))
        
        # Wrap data loaders for distributed training
        train_loader = train.torch.prepare_data_loader(train_loader)
        val_loader = train.torch.prepare_data_loader(val_loader)
        
        # Initialize model
        model = asyncio.run(self._initialize_model(config))
        model = train.torch.prepare_model(model)
        
        # Initialize optimizer
        optimizer = self._get_optimizer(model, config)
        
        # Initialize scheduler
        scheduler = self._get_scheduler(optimizer, config)
        
        # Initialize loss function
        criterion = self._get_loss_function(config)
        
        # Training loop
        for epoch in range(config.num_epochs):
            # Training phase
            train_loss, train_acc = asyncio.run(self._train_epoch(
                model, train_loader, optimizer, criterion, epoch, config
            ))
            
            # Validation phase
            val_loss, val_acc = asyncio.run(self._validate_epoch(
                model, val_loader, criterion, epoch, config
            ))
            
            # Report metrics to Ray
            train.report({
                "epoch": epoch,
                "train_loss": train_loss,
                "train_accuracy": train_acc,
                "val_loss": val_loss,
                "val_accuracy": val_acc
            })
            
            # Learning rate scheduling
            if scheduler:
                if isinstance(scheduler, ReduceLROnPlateau):
                    scheduler.step(val_loss)
                else:
                    scheduler.step()
        
        return {
            "final_train_loss": train_loss,
            "final_val_loss": val_loss,
            "final_train_accuracy": train_acc,
            "final_val_accuracy": val_acc
        }
    
    async def _prepare_data_loaders(self, config: TrainingConfig) -> tuple:
        """Prepare data loaders"""
        
        # This is a placeholder - implement based on your data format
        from torch.utils.data import TensorDataset
        
        # Create dummy data for demonstration
        X = torch.randn(1000, 3, 224, 224)
        y = torch.randint(0, 10, (1000,))
        
        dataset = TensorDataset(X, y)
        
        # Split into train/validation
        train_size = int((1 - config.validation_split) * len(dataset))
        val_size = len(dataset) - train_size
        
        train_dataset, val_dataset = torch.utils.data.random_split(
            dataset, [train_size, val_size]
        )
        
        # Create data loaders
        train_loader = DataLoader(
            train_dataset,
            batch_size=config.batch_size,
            shuffle=True,
            num_workers=4,
            pin_memory=True
        )
        
        val_loader = DataLoader(
            val_dataset,
            batch_size=config.batch_size,
            shuffle=False,
            num_workers=4,
            pin_memory=True
        )
        
        return train_loader, val_loader
    
    async def _initialize_model(self, config: TrainingConfig) -> nn.Module:
        """Initialize model based on configuration"""
        
        if config.model_type == "resnet50":
            from torchvision.models import resnet50
            model = resnet50(pretrained=True)
            
            # Modify final layer for custom number of classes
            num_classes = config.model_config.get("num_classes", 10)
            model.fc = nn.Linear(model.fc.in_features, num_classes)
            
        elif config.model_type == "efficientnet_b0":
            from torchvision.models import efficientnet_b0
            model = efficientnet_b0(pretrained=True)
            
            # Modify final layer
            num_classes = config.model_config.get("num_classes", 10)
            model.classifier[1] = nn.Linear(model.classifier[1].in_features, num_classes)
            
        elif config.model_type == "vit_base":
            from torchvision.models import vit_b_16
            model = vit_b_16(pretrained=True)
            
            # Modify final layer
            num_classes = config.model_config.get("num_classes", 10)
            model.heads[0] = nn.Linear(model.heads[0].in_features, num_classes)
            
        else:
            raise ValueError(f"Unsupported model type: {config.model_type}")
        
        # Add dropout if specified
        if config.dropout_rate > 0:
            # This is a simplified implementation
            # In practice, you'd modify the model architecture appropriately
            pass
        
        return model
    
    def _get_optimizer(self, model: nn.Module, config: TrainingConfig) -> optim.Optimizer:
        """Get optimizer based on configuration"""
        
        if config.optimizer == "adam":
            return optim.Adam(
                model.parameters(),
                lr=config.learning_rate,
                weight_decay=config.weight_decay
            )
        elif config.optimizer == "sgd":
            return optim.SGD(
                model.parameters(),
                lr=config.learning_rate,
                momentum=0.9,
                weight_decay=config.weight_decay
            )
        elif config.optimizer == "adamw":
            return optim.AdamW(
                model.parameters(),
                lr=config.learning_rate,
                weight_decay=config.weight_decay
            )
        else:
            raise ValueError(f"Unsupported optimizer: {config.optimizer}")
    
    def _get_scheduler(self, optimizer: optim.Optimizer, config: TrainingConfig) -> Optional[optim.lr_scheduler._LRScheduler]:
        """Get learning rate scheduler"""
        
        if config.scheduler == "cosine":
            return CosineAnnealingLR(optimizer, T_max=config.num_epochs)
        elif config.scheduler == "step":
            return StepLR(optimizer, step_size=config.num_epochs // 3, gamma=0.1)
        elif config.scheduler == "plateau":
            return ReduceLROnPlateau(optimizer, patience=5, factor=0.5, verbose=True)
        elif config.scheduler == "none":
            return None
        else:
            raise ValueError(f"Unsupported scheduler: {config.scheduler}")
    
    def _get_loss_function(self, config: TrainingConfig) -> nn.Module:
        """Get loss function based on configuration"""
        
        loss_type = config.model_config.get("loss_function", "cross_entropy")
        
        if loss_type == "cross_entropy":
            return nn.CrossEntropyLoss()
        elif loss_type == "mse":
            return nn.MSELoss()
        elif loss_type == "bce":
            return nn.BCEWithLogitsLoss()
        else:
            raise ValueError(f"Unsupported loss function: {loss_type}")
    
    async def _train_epoch(
        self,
        model: nn.Module,
        train_loader: DataLoader,
        optimizer: optim.Optimizer,
        criterion: nn.Module,
        epoch: int,
        config: TrainingConfig
    ) -> tuple:
        """Train for one epoch"""
        
        model.train()
        
        total_loss = 0.0
        correct = 0
        total = 0
        
        for batch_idx, (data, targets) in enumerate(train_loader):
            data, targets = data.to(DEVICE), targets.to(DEVICE)
            
            optimizer.zero_grad()
            
            # Forward pass
            outputs = model(data)
            loss = criterion(outputs, targets)
            
            # Backward pass
            loss.backward()
            optimizer.step()
            
            # Statistics
            total_loss += loss.item()
            _, predicted = outputs.max(1)
            total += targets.size(0)
            correct += predicted.eq(targets).sum().item()
            
            # Logging
            if batch_idx % config.log_frequency == 0:
                logger.info(f'Epoch {epoch}, Batch {batch_idx}, Loss: {loss.item():.4f}')
        
        avg_loss = total_loss / len(train_loader)
        accuracy = correct / total
        
        return avg_loss, accuracy
    
    async def _validate_epoch(
        self,
        model: nn.Module,
        val_loader: DataLoader,
        criterion: nn.Module,
        epoch: int,
        config: TrainingConfig
    ) -> tuple:
        """Validate for one epoch"""
        
        model.eval()
        
        total_loss = 0.0
        correct = 0
        total = 0
        
        with torch.no_grad():
            for data, targets in val_loader:
                data, targets = data.to(DEVICE), targets.to(DEVICE)
                
                outputs = model(data)
                loss = criterion(outputs, targets)
                
                total_loss += loss.item()
                _, predicted = outputs.max(1)
                total += targets.size(0)
                correct += predicted.eq(targets).sum().item()
        
        avg_loss = total_loss / len(val_loader)
        accuracy = correct / total
        
        logger.info(f'Epoch {epoch}, Val Loss: {avg_loss:.4f}, Val Acc: {accuracy:.4f}')
        
        return avg_loss, accuracy
    
    async def optimize_hyperparameters(
        self,
        config: HyperparameterConfig,
        base_config: TrainingConfig
    ) -> Dict[str, Any]:
        """Optimize hyperparameters using Optuna"""
        
        logger.info("Starting hyperparameter optimization")
        
        # Create Optuna study
        study = optuna.create_study(
            direction=config.optimization_direction,
            sampler=optuna.samplers.TPESampler(),
            pruner=optuna.pruners.MedianPruner()
        )
        
        def objective(trial):
            # Sample hyperparameters
            trial_config = base_config.copy()
            
            for param_name, param_config in config.search_space.items():
                if param_config["type"] == "float":
                    value = trial.suggest_float(
                        param_name,
                        param_config["low"],
                        param_config["high"],
                        log=param_config.get("log", False)
                    )
                elif param_config["type"] == "int":
                    value = trial.suggest_int(
                        param_name,
                        param_config["low"],
                        param_config["high"],
                        log=param_config.get("log", False)
                    )
                elif param_config["type"] == "categorical":
                    value = trial.suggest_categorical(
                        param_name,
                        param_config["choices"]
                    )
                else:
                    continue
                
                # Set parameter value
                setattr(trial_config, param_name, value)
            
            # Run training
            result = asyncio.run(self._execute_single_node_training(
                trial_config,
                Path(EXPERIMENT_DATA_PATH) / f"trial_{trial.number}"
            ))
            
            # Return metric to optimize
            return result["metrics"].get(config.optimization_metric, float('inf'))
        
        # Optimize
        study.optimize(
            objective,
            n_trials=config.num_trials,
            timeout=config.timeout,
            n_jobs=config.concurrent_trials
        )
        
        return {
            "best_params": study.best_params,
            "best_value": study.best_value,
            "n_trials": len(study.trials),
            "study_summary": study.trials_dataframe().to_dict()
        }
    
    async def get_job_status(self, job_id: str) -> TrainingJobResponse:
        """Get job status"""
        
        with self.SessionLocal() as db:
            db_job = db.query(TrainingJob).filter(TrainingJob.id == job_id).first()
            
            if not db_job:
                raise HTTPException(status_code=404, detail="Job not found")
            
            return TrainingJobResponse(
                job_id=str(db_job.id),
                status=db_job.status,
                name=db_job.name,
                created_at=db_job.created_at,
                start_time=db_job.start_time,
                end_time=db_job.end_time,
                metrics=db_job.metrics,
                error_message=db_job.error_message
            )
    
    async def list_jobs(self, limit: int = 50, status: Optional[str] = None) -> List[TrainingJobResponse]:
        """List training jobs"""
        
        with self.SessionLocal() as db:
            query = db.query(TrainingJob)
            
            if status:
                query = query.filter(TrainingJob.status == status)
            
            jobs = query.order_by(TrainingJob.created_at.desc()).limit(limit).all()
            
            return [
                TrainingJobResponse(
                    job_id=str(job.id),
                    status=job.status,
                    name=job.name,
                    created_at=job.created_at,
                    start_time=job.start_time,
                    end_time=job.end_time,
                    metrics=job.metrics,
                    error_message=job.error_message
                ) for job in jobs
            ]
    
    async def cancel_job(self, job_id: str) -> Dict[str, str]:
        """Cancel a training job"""
        
        with self.SessionLocal() as db:
            db_job = db.query(TrainingJob).filter(TrainingJob.id == job_id).first()
            
            if not db_job:
                raise HTTPException(status_code=404, detail="Job not found")
            
            if db_job.status == "completed":
                raise HTTPException(status_code=400, detail="Job already completed")
            
            db_job.status = "cancelled"
            db_job.end_time = datetime.utcnow()
            db.commit()
            
            return {"message": f"Job {job_id} cancelled"}
    
    def get_system_stats(self) -> Dict[str, Any]:
        """Get system statistics"""
        
        return {
            "active_jobs": len(self.active_jobs),
            "queue_size": len(self.job_queue),
            "cpu_usage": psutil.cpu_percent(),
            "memory_usage": psutil.virtual_memory().percent,
            "disk_usage": psutil.disk_usage('/').percent,
            "gpu_available": torch.cuda.is_available(),
            "gpu_count": torch.cuda.device_count() if torch.cuda.is_available() else 0
        }

# Initialize service
service = TrainingService()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    logger.info("Starting AnnotateAI Training Service")
    yield
    logger.info("Shutting down AnnotateAI Training Service")

# Create FastAPI app
app = FastAPI(
    title="AnnotateAI Training Service",
    description="Distributed training system with MLOps pipeline",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "device": DEVICE,
        "ray_initialized": ray.is_initialized()
    }

@app.post("/training/jobs", response_model=TrainingJobResponse)
async def create_training_job(
    request: TrainingJobRequest,
    background_tasks: BackgroundTasks
):
    """Create a new training job"""
    return await service.create_training_job(request, background_tasks)

@app.get("/training/jobs/{job_id}", response_model=TrainingJobResponse)
async def get_training_job(job_id: str):
    """Get training job status"""
    return await service.get_job_status(job_id)

@app.get("/training/jobs", response_model=List[TrainingJobResponse])
async def list_training_jobs(
    limit: int = 50,
    status: Optional[str] = None
):
    """List training jobs"""
    return await service.list_jobs(limit, status)

@app.delete("/training/jobs/{job_id}")
async def cancel_training_job(job_id: str):
    """Cancel a training job"""
    return await service.cancel_job(job_id)

@app.post("/training/optimize")
async def optimize_hyperparameters(
    config: HyperparameterConfig,
    base_config: TrainingConfig
):
    """Optimize hyperparameters"""
    return await service.optimize_hyperparameters(config, base_config)

@app.get("/system/stats")
async def get_system_stats():
    """Get system statistics"""
    return service.get_system_stats()

@app.get("/metrics")
async def get_metrics():
    """Get Prometheus metrics"""
    from fastapi.responses import Response
    return Response(generate_latest(), media_type="text/plain")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 