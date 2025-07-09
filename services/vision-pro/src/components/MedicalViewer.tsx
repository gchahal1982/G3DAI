import React, { useState, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Box, Grid } from '@react-three/drei';
import { motion } from 'framer-motion';
import {
    LineChart,
    Line,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import {
    MedicalAnalysis,
    Anomaly,
    StudyType,
    DICOMMetadata
} from '../types/medical';
import { clsx } from 'clsx';

interface MedicalViewerProps {
    study: {
        metadata: DICOMMetadata;
        imageData: Float32Array;
    };
    analysis: MedicalAnalysis;
    onAnnotate?: (anomaly: Anomaly, annotation: string) => void;
}

type ViewMode = '2d' | '3d' | 'mpr' | 'fusion';

export const MedicalViewer: React.FC<MedicalViewerProps> = ({
    study,
    analysis,
    onAnnotate
}) => {
    const [viewMode, setViewMode] = useState<ViewMode>('3d');
    const [selectedAnomaly, setSelectedAnomaly] = useState<Anomaly | null>(null);
    const [windowLevel, setWindowLevel] = useState({ window: 400, level: 40 });
    const [crosshairPosition, setCrosshairPosition] = useState({ x: 0.5, y: 0.5, z: 0.5 });

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const viewportRef = useRef<HTMLDivElement>(null);

    // Glassmorphism styles
    const glassStyle = {
        background: 'rgba(30, 30, 40, 0.85)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
    };

    const medicalGlassStyle = {
        ...glassStyle,
        background: 'rgba(41, 98, 255, 0.08)',
        border: '1px solid rgba(41, 98, 255, 0.25)'
    };

    const criticalGlassStyle = {
        ...glassStyle,
        background: 'rgba(239, 68, 68, 0.08)',
        border: '1px solid rgba(239, 68, 68, 0.25)'
    };

    const successGlassStyle = {
        ...glassStyle,
        background: 'rgba(34, 197, 94, 0.08)',
        border: '1px solid rgba(34, 197, 94, 0.25)'
    };

    return (
        <div className="flex flex-col h-full w-full bg-gray-950 text-white">
            {/* Header */}
            <div className="flex items-center justify-between p-4" style={glassStyle}>
                <div className="flex items-center gap-6">
                    <PatientInfo study={study} />
                    <StudyMetrics analysis={analysis} />
                </div>

                <ViewModeSelector
                    mode={viewMode}
                    onChange={setViewMode}
                    style={medicalGlassStyle}
                />
            </div>

            {/* Main Viewport */}
            <div className="flex flex-1 gap-4 p-4">
                {/* Viewer Area */}
                <div className="flex-1 relative" ref={viewportRef}>
                    <motion.div
                        className="h-full w-full relative"
                        style={glassStyle}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        {viewMode === '3d' && (
                            <Viewport3D
                                data={analysis.visualization}
                                anomalies={analysis.anomalies}
                                onAnomalyClick={setSelectedAnomaly}
                            />
                        )}

                        {viewMode === '2d' && (
                            <Viewport2D
                                imageData={study.imageData}
                                metadata={study.metadata}
                                anomalies={analysis.anomalies}
                                windowLevel={windowLevel}
                                onWindowLevelChange={setWindowLevel}
                            />
                        )}

                        {viewMode === 'mpr' && (
                            <MPRViewer
                                volumeData={analysis.visualization.volumeData}
                                crosshair={crosshairPosition}
                                onCrosshairChange={setCrosshairPosition}
                            />
                        )}

                        {/* Overlay Controls */}
                        <ViewportControls
                            viewMode={viewMode}
                            windowLevel={windowLevel}
                            onWindowLevelChange={setWindowLevel}
                        />
                    </motion.div>
                </div>

                {/* Analysis Panel */}
                <div className="w-96 flex flex-col gap-4">
                    {/* Findings List */}
                    <motion.div
                        className="flex-1 overflow-hidden"
                        style={glassStyle}
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                    >
                        <div className="p-4 border-b border-white/10">
                            <h3 className="text-lg font-semibold">AI Findings</h3>
                            <p className="text-sm text-gray-400 mt-1">
                                {analysis.anomalies.length} anomalies detected
                            </p>
                        </div>

                        <div className="overflow-y-auto max-h-96 p-4 space-y-3">
                            {analysis.anomalies.map((anomaly) => (
                                <FindingCard
                                    key={anomaly.id}
                                    anomaly={anomaly}
                                    isSelected={selectedAnomaly?.id === anomaly.id}
                                    onClick={() => setSelectedAnomaly(anomaly)}
                                    style={
                                        anomaly.severity === 'critical'
                                            ? criticalGlassStyle
                                            : anomaly.severity === 'high'
                                                ? { ...glassStyle, background: 'rgba(251, 191, 36, 0.08)', border: '1px solid rgba(251, 191, 36, 0.25)' }
                                                : successGlassStyle
                                    }
                                />
                            ))}
                        </div>
                    </motion.div>

                    {/* AI Report */}
                    <motion.div
                        className="h-64"
                        style={glassStyle}
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                    >
                        <div className="p-4 border-b border-white/10">
                            <h3 className="text-lg font-semibold">AI Generated Report</h3>
                            <p className="text-sm text-gray-400 mt-1">
                                Confidence: {(analysis.confidence * 100).toFixed(1)}%
                            </p>
                        </div>

                        <div className="p-4 space-y-4 overflow-y-auto max-h-48">
                            <ReportSection
                                title="Impressions"
                                items={analysis.report.impressions}
                            />
                            <ReportSection
                                title="Recommendations"
                                items={analysis.report.recommendations}
                            />
                        </div>
                    </motion.div>

                    {/* Actions */}
                    <motion.div
                        className="flex gap-3"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.3, delay: 0.3 }}
                    >
                        <button
                            className="flex-1 px-4 py-2 rounded-lg transition-all"
                            style={{
                                ...medicalGlassStyle,
                                ':hover': { background: 'rgba(41, 98, 255, 0.15)' }
                            }}
                            onClick={() => console.log('Approve report')}
                        >
                            Approve Report
                        </button>
                        <button
                            className="flex-1 px-4 py-2 rounded-lg transition-all"
                            style={glassStyle}
                            onClick={() => console.log('Edit findings')}
                        >
                            Edit Findings
                        </button>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

// Sub-components

const PatientInfo: React.FC<{ study: any }> = ({ study }) => (
    <div>
        <h2 className="text-xl font-semibold">
            Study ID: {study.metadata.studyId}
        </h2>
        <p className="text-sm text-gray-400">
            {study.metadata.modality} • {new Date(study.metadata.studyDate).toLocaleDateString()}
        </p>
    </div>
);

const StudyMetrics: React.FC<{ analysis: MedicalAnalysis }> = ({ analysis }) => (
    <div className="flex gap-6">
        <div>
            <p className="text-xs text-gray-400">Processing Time</p>
            <p className="text-lg font-semibold">
                {(analysis.processingInfo.duration / 1000).toFixed(1)}s
            </p>
        </div>
        <div>
            <p className="text-xs text-gray-400">AI Model</p>
            <p className="text-lg font-semibold">
                {analysis.regulatoryInfo.aiModelVersion}
            </p>
        </div>
    </div>
);

const ViewModeSelector: React.FC<{
    mode: ViewMode;
    onChange: (mode: ViewMode) => void;
    style: any;
}> = ({ mode, onChange, style }) => {
    const modes: { value: ViewMode; label: string; icon: string }[] = [
        { value: '2d', label: '2D View', icon: '⬜' },
        { value: '3d', label: '3D View', icon: '🎲' },
        { value: 'mpr', label: 'MPR', icon: '➕' },
        { value: 'fusion', label: 'Fusion', icon: '🔄' }
    ];

    return (
        <div className="flex gap-2 p-1 rounded-lg" style={style}>
            {modes.map(({ value, label, icon }) => (
                <button
                    key={value}
                    onClick={() => onChange(value)}
                    className={clsx(
                        'px-4 py-2 rounded-md transition-all flex items-center gap-2',
                        mode === value
                            ? 'bg-white/20 text-white'
                            : 'text-gray-400 hover:text-white hover:bg-white/10'
                    )}
                >
                    <span>{icon}</span>
                    <span>{label}</span>
                </button>
            ))}
        </div>
    );
};

const Viewport3D: React.FC<{
    data: any;
    anomalies: Anomaly[];
    onAnomalyClick: (anomaly: Anomaly) => void;
}> = ({ data, anomalies, onAnomalyClick }) => {
    return (
        <Canvas camera={{ position: [5, 5, 5], fov: 50 }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />

            {/* 3D Volume Rendering Placeholder */}
            <Box args={[3, 3, 3]} position={[0, 0, 0]}>
                <meshStandardMaterial
                    color="#4a9eff"
                    transparent
                    opacity={0.3}
                    wireframe
                />
            </Box>

            {/* Anomaly Markers */}
            {anomalies.map((anomaly) => (
                <mesh
                    key={anomaly.id}
                    position={[
                        (anomaly.location.x / 256 - 0.5) * 3,
                        (anomaly.location.y / 256 - 0.5) * 3,
                        (anomaly.location.z || 128) / 256 - 0.5 * 3
                    ]}
                    onClick={() => onAnomalyClick(anomaly)}
                >
                    <sphereGeometry args={[0.1, 16, 16]} />
                    <meshStandardMaterial
                        color={anomaly.severity === 'critical' ? '#ef4444' : '#fbbf24'}
                        emissive={anomaly.severity === 'critical' ? '#ef4444' : '#fbbf24'}
                        emissiveIntensity={0.5}
                    />
                </mesh>
            ))}

            <Grid args={[10, 10]} position={[0, -1.5, 0]} />
            <OrbitControls enablePan enableZoom enableRotate />
        </Canvas>
    );
};

const Viewport2D: React.FC<{
    imageData: Float32Array;
    metadata: DICOMMetadata;
    anomalies: Anomaly[];
    windowLevel: { window: number; level: number };
    onWindowLevelChange: (wl: { window: number; level: number }) => void;
}> = ({ imageData, metadata, anomalies, windowLevel, onWindowLevelChange }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!canvasRef.current) return;

        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;

        // Apply window/level to image data
        const imageDataObj = ctx.createImageData(metadata.columns, metadata.rows);
        const data = imageDataObj.data;

        const min = windowLevel.level - windowLevel.window / 2;
        const max = windowLevel.level + windowLevel.window / 2;

        for (let i = 0; i < imageData.length; i++) {
            const value = imageData[i];
            const normalized = Math.max(0, Math.min(255, ((value - min) / (max - min)) * 255));

            const pixelIndex = i * 4;
            data[pixelIndex] = normalized;     // R
            data[pixelIndex + 1] = normalized; // G
            data[pixelIndex + 2] = normalized; // B
            data[pixelIndex + 3] = 255;        // A
        }

        ctx.putImageData(imageDataObj, 0, 0);

        // Draw anomaly overlays
        anomalies.forEach((anomaly) => {
            ctx.strokeStyle = anomaly.severity === 'critical' ? '#ef4444' : '#fbbf24';
            ctx.lineWidth = 2;
            ctx.strokeRect(
                anomaly.visualizations.bbox.x,
                anomaly.visualizations.bbox.y,
                anomaly.visualizations.bbox.width,
                anomaly.visualizations.bbox.height
            );
        });

    }, [imageData, metadata, anomalies, windowLevel]);

    return (
        <div className="relative w-full h-full flex items-center justify-center">
            <canvas
                ref={canvasRef}
                width={metadata.columns}
                height={metadata.rows}
                className="max-w-full max-h-full object-contain"
            />
        </div>
    );
};

const MPRViewer: React.FC<{
    volumeData: any;
    crosshair: { x: number; y: number; z: number };
    onCrosshairChange: (pos: { x: number; y: number; z: number }) => void;
}> = ({ volumeData, crosshair, onCrosshairChange }) => {
    return (
        <div className="grid grid-cols-2 grid-rows-2 gap-2 h-full p-2">
            {/* Axial View */}
            <div className="relative bg-black rounded-lg overflow-hidden">
                <div className="absolute top-2 left-2 text-xs text-white/70">Axial</div>
                <div className="w-full h-full bg-gray-800" />
            </div>

            {/* Sagittal View */}
            <div className="relative bg-black rounded-lg overflow-hidden">
                <div className="absolute top-2 left-2 text-xs text-white/70">Sagittal</div>
                <div className="w-full h-full bg-gray-800" />
            </div>

            {/* Coronal View */}
            <div className="relative bg-black rounded-lg overflow-hidden">
                <div className="absolute top-2 left-2 text-xs text-white/70">Coronal</div>
                <div className="w-full h-full bg-gray-800" />
            </div>

            {/* 3D View */}
            <div className="relative bg-black rounded-lg overflow-hidden">
                <div className="absolute top-2 left-2 text-xs text-white/70">3D</div>
                <div className="w-full h-full bg-gray-800" />
            </div>
        </div>
    );
};

const ViewportControls: React.FC<{
    viewMode: ViewMode;
    windowLevel: { window: number; level: number };
    onWindowLevelChange: (wl: { window: number; level: number }) => void;
}> = ({ viewMode, windowLevel, onWindowLevelChange }) => {
    if (viewMode !== '2d') return null;

    return (
        <div className="absolute bottom-4 left-4 p-3 rounded-lg"
            style={{ background: 'rgba(30, 30, 40, 0.9)', backdropFilter: 'blur(10px)' }}>
            <div className="space-y-2">
                <div>
                    <label className="text-xs text-gray-400">Window</label>
                    <input
                        type="range"
                        min="1"
                        max="2000"
                        value={windowLevel.window}
                        onChange={(e) => onWindowLevelChange({
                            ...windowLevel,
                            window: parseInt(e.target.value)
                        })}
                        className="w-32"
                    />
                    <span className="text-xs ml-2">{windowLevel.window}</span>
                </div>
                <div>
                    <label className="text-xs text-gray-400">Level</label>
                    <input
                        type="range"
                        min="-1000"
                        max="1000"
                        value={windowLevel.level}
                        onChange={(e) => onWindowLevelChange({
                            ...windowLevel,
                            level: parseInt(e.target.value)
                        })}
                        className="w-32"
                    />
                    <span className="text-xs ml-2">{windowLevel.level}</span>
                </div>
            </div>
        </div>
    );
};

const FindingCard: React.FC<{
    anomaly: Anomaly;
    isSelected: boolean;
    onClick: () => void;
    style: any;
}> = ({ anomaly, isSelected, onClick, style }) => {
    return (
        <motion.div
            className={clsx(
                'p-3 rounded-lg cursor-pointer transition-all',
                isSelected && 'ring-2 ring-blue-500'
            )}
            style={style}
            onClick={onClick}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
        >
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <h4 className="font-medium capitalize">{anomaly.type}</h4>
                    <p className="text-sm text-gray-400 mt-1">
                        {anomaly.description}
                    </p>
                    <div className="flex gap-3 mt-2 text-xs">
                        <span>Size: {anomaly.size.toFixed(1)}mm</span>
                        <span>•</span>
                        <span>Confidence: {(anomaly.confidence * 100).toFixed(0)}%</span>
                    </div>
                </div>

                <div className={clsx(
                    'w-3 h-3 rounded-full',
                    anomaly.severity === 'critical' && 'bg-red-500',
                    anomaly.severity === 'high' && 'bg-amber-500',
                    anomaly.severity === 'moderate' && 'bg-yellow-500',
                    anomaly.severity === 'low' && 'bg-green-500'
                )} />
            </div>

            {anomaly.recommendations.length > 0 && (
                <div className="mt-3 pt-3 border-t border-white/10">
                    <p className="text-xs text-gray-400">Recommendation:</p>
                    <p className="text-xs mt-1">{anomaly.recommendations[0]}</p>
                </div>
            )}
        </motion.div>
    );
};

const ReportSection: React.FC<{
    title: string;
    items: string[];
}> = ({ title, items }) => {
    if (items.length === 0) return null;

    return (
        <div>
            <h4 className="text-sm font-medium text-gray-300">{title}:</h4>
            <ul className="mt-1 space-y-1">
                {items.map((item, index) => (
                    <li key={index} className="text-sm text-gray-400">
                        • {item}
                    </li>
                ))}
            </ul>
        </div>
    );
};