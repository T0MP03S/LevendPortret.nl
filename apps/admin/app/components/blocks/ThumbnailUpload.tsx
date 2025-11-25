"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Upload, X, ImageIcon, Loader2, Move, Check } from "lucide-react";

interface Props {
  value: string | null;
  onChange: (url: string | null) => void;
}

// Target dimensions for thumbnail (16:9 aspect ratio)
const TARGET_WIDTH = 1280;
const TARGET_HEIGHT = 720;
const ASPECT_RATIO = TARGET_WIDTH / TARGET_HEIGHT;

interface CropState {
  file: File;
  imageUrl: string;
  imgWidth: number;
  imgHeight: number;
  offsetX: number;
  offsetY: number;
  scale: number;
}

export default function ThumbnailUpload({ value, onChange }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [cropState, setCropState] = useState<CropState | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, offsetX: 0, offsetY: 0 });
  const previewRef = useRef<HTMLDivElement>(null);

  // Load image and open crop modal
  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Alleen afbeeldingen toegestaan");
      return;
    }
    setError("");
    
    const img = new Image();
    img.onload = () => {
      // Calculate initial scale to fill the crop area
      const scaleX = TARGET_WIDTH / img.width;
      const scaleY = TARGET_HEIGHT / img.height;
      const scale = Math.max(scaleX, scaleY); // Use max to ensure image fills the area
      
      setCropState({
        file,
        imageUrl: URL.createObjectURL(file),
        imgWidth: img.width,
        imgHeight: img.height,
        offsetX: 0,
        offsetY: 0,
        scale,
      });
    };
    img.onerror = () => setError("Kon afbeelding niet laden");
    img.src = URL.createObjectURL(file);
  };

  // Block body scroll when modal is open
  useEffect(() => {
    if (cropState) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [cropState]);

  // Handle drag to reposition (mouse)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!cropState) return;
    e.preventDefault();
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      offsetX: cropState.offsetX,
      offsetY: cropState.offsetY,
    };
  };

  // Handle drag to reposition (touch)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!cropState) return;
    e.preventDefault();
    const touch = e.touches[0];
    setIsDragging(true);
    dragStart.current = {
      x: touch.clientX,
      y: touch.clientY,
      offsetX: cropState.offsetX,
      offsetY: cropState.offsetY,
    };
  };

  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (!isDragging || !cropState) return;
    
    const dx = clientX - dragStart.current.x;
    const dy = clientY - dragStart.current.y;
    
    // Calculate bounds
    const scaledW = cropState.imgWidth * cropState.scale;
    const scaledH = cropState.imgHeight * cropState.scale;
    const maxOffsetX = Math.max(0, (scaledW - TARGET_WIDTH) / 2);
    const maxOffsetY = Math.max(0, (scaledH - TARGET_HEIGHT) / 2);
    
    const newOffsetX = Math.max(-maxOffsetX, Math.min(maxOffsetX, dragStart.current.offsetX + dx));
    const newOffsetY = Math.max(-maxOffsetY, Math.min(maxOffsetY, dragStart.current.offsetY + dy));
    
    setCropState(prev => prev ? { ...prev, offsetX: newOffsetX, offsetY: newOffsetY } : null);
  }, [isDragging, cropState]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    handleMove(e.clientX, e.clientY);
  }, [handleMove]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleMove(touch.clientX, touch.clientY);
  }, [handleMove]);

  const handleEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleEnd);
      window.addEventListener("touchmove", handleTouchMove, { passive: false });
      window.addEventListener("touchend", handleEnd);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleEnd);
        window.removeEventListener("touchmove", handleTouchMove);
        window.removeEventListener("touchend", handleEnd);
      };
    }
  }, [isDragging, handleMouseMove, handleTouchMove, handleEnd]);

  // Handle scale change
  const handleScaleChange = (newScale: number) => {
    if (!cropState) return;
    
    // Ensure minimum scale fills the crop area
    const minScaleX = TARGET_WIDTH / cropState.imgWidth;
    const minScaleY = TARGET_HEIGHT / cropState.imgHeight;
    const minScale = Math.max(minScaleX, minScaleY);
    const clampedScale = Math.max(minScale, newScale);
    
    // Recalculate bounds with new scale
    const scaledW = cropState.imgWidth * clampedScale;
    const scaledH = cropState.imgHeight * clampedScale;
    const maxOffsetX = Math.max(0, (scaledW - TARGET_WIDTH) / 2);
    const maxOffsetY = Math.max(0, (scaledH - TARGET_HEIGHT) / 2);
    
    setCropState(prev => prev ? {
      ...prev,
      scale: clampedScale,
      offsetX: Math.max(-maxOffsetX, Math.min(maxOffsetX, prev.offsetX)),
      offsetY: Math.max(-maxOffsetY, Math.min(maxOffsetY, prev.offsetY)),
    } : null);
  };

  // Crop and upload
  const handleCropConfirm = async () => {
    if (!cropState) return;
    
    setUploading(true);
    setCropState(null);
    
    try {
      const img = new Image();
      img.src = cropState.imageUrl;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });
      
      const canvas = document.createElement("canvas");
      canvas.width = TARGET_WIDTH;
      canvas.height = TARGET_HEIGHT;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas context niet beschikbaar");
      
      // Calculate source rectangle
      const scaledW = cropState.imgWidth * cropState.scale;
      const scaledH = cropState.imgHeight * cropState.scale;
      
      // Center of the crop area in scaled image coordinates
      const cropCenterX = scaledW / 2 - cropState.offsetX;
      const cropCenterY = scaledH / 2 - cropState.offsetY;
      
      // Convert to original image coordinates
      const srcCenterX = cropCenterX / cropState.scale;
      const srcCenterY = cropCenterY / cropState.scale;
      const srcW = TARGET_WIDTH / cropState.scale;
      const srcH = TARGET_HEIGHT / cropState.scale;
      
      const srcX = srcCenterX - srcW / 2;
      const srcY = srcCenterY - srcH / 2;
      
      ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, TARGET_WIDTH, TARGET_HEIGHT);
      
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => b ? resolve(b) : reject(new Error("Kon afbeelding niet converteren")),
          "image/jpeg",
          0.85
        );
      });
      
      const resizedFile = new File([blob], cropState.file.name.replace(/\.[^.]+$/, ".jpg"), {
        type: "image/jpeg",
      });

      const res = await fetch("/api/admin/upload/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: resizedFile.name, contentType: "image/jpeg" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload mislukt");

      const uploadRes = await fetch(data.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": "image/jpeg" },
        body: resizedFile,
      });
      if (!uploadRes.ok) throw new Error("Upload naar storage mislukt");

      onChange(data.publicUrl);
    } catch (e: any) {
      setError(e?.message || "Upload mislukt");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  // Calculate preview dimensions (responsive - smaller on mobile)
  const [previewScale, setPreviewScale] = useState(0.5);
  
  useEffect(() => {
    const updateScale = () => {
      // On mobile (< 640px), use smaller scale
      const isMobile = window.innerWidth < 640;
      setPreviewScale(isMobile ? 0.25 : 0.5);
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);
  
  const previewW = TARGET_WIDTH * previewScale;
  const previewH = TARGET_HEIGHT * previewScale;

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-zinc-700">Thumbnail</label>
      
      {/* Crop Modal */}
      {cropState && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-auto">
            <div className="p-4 border-b border-zinc-200">
              <h3 className="font-semibold text-lg">Thumbnail positioneren</h3>
              <p className="text-sm text-zinc-500">Sleep de afbeelding om te positioneren</p>
            </div>
            
            <div className="p-4 flex flex-col items-center gap-4">
              {/* Crop preview */}
              <div
                ref={previewRef}
                className="relative overflow-hidden bg-zinc-900 cursor-move select-none touch-none"
                style={{ width: previewW, height: previewH }}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
              >
                <img
                  src={cropState.imageUrl}
                  alt="Preview"
                  draggable={false}
                  className="absolute pointer-events-none"
                  style={{
                    width: `${cropState.imgWidth * cropState.scale * previewScale}px`,
                    height: `${cropState.imgHeight * cropState.scale * previewScale}px`,
                    left: `${(previewW / 2) + (cropState.offsetX * previewScale) - (cropState.imgWidth * cropState.scale * previewScale / 2)}px`,
                    top: `${(previewH / 2) + (cropState.offsetY * previewScale) - (cropState.imgHeight * cropState.scale * previewScale / 2)}px`,
                    maxWidth: 'none',
                    maxHeight: 'none',
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <Move className="w-8 h-8 text-white/50" />
                </div>
              </div>
              
              {/* Scale slider */}
              <div className="w-full max-w-md">
                <label className="block text-sm text-zinc-600 mb-1">Zoom</label>
                <input
                  type="range"
                  min={Math.max(TARGET_WIDTH / cropState.imgWidth, TARGET_HEIGHT / cropState.imgHeight)}
                  max={Math.max(TARGET_WIDTH / cropState.imgWidth, TARGET_HEIGHT / cropState.imgHeight) * 3}
                  step={0.01}
                  value={cropState.scale}
                  onChange={(e) => handleScaleChange(parseFloat(e.target.value))}
                  className="w-full accent-coral"
                />
              </div>
              
              <p className="text-xs text-zinc-400">
                Uitvoer: {TARGET_WIDTH}x{TARGET_HEIGHT}px (16:9)
              </p>
            </div>
            
            <div className="p-4 border-t border-zinc-200 flex justify-end gap-2">
              <button
                onClick={() => setCropState(null)}
                className="px-4 py-2 text-sm border border-zinc-200 rounded-lg hover:bg-zinc-50"
              >
                Annuleren
              </button>
              <button
                onClick={handleCropConfirm}
                className="px-4 py-2 text-sm bg-coral text-white rounded-lg hover:bg-coral/90 flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                Bevestigen
              </button>
            </div>
          </div>
        </div>
      )}
      
      {value ? (
        <div className="relative group">
          <img src={value} alt="Thumbnail" className="w-full aspect-video object-cover rounded-lg border border-zinc-200" />
          <button
            type="button"
            onClick={async () => {
              // Delete from R2
              try {
                await fetch('/api/admin/upload/delete', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ url: value }),
                });
              } catch (e) {
                console.error('Failed to delete from R2:', e);
              }
              onChange(null);
            }}
            className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-4 h-4 text-zinc-600" />
          </button>
        </div>
      ) : uploading ? (
        <div className="border-2 border-dashed border-coral/50 rounded-lg p-6 text-center bg-coral/5">
          <Loader2 className="w-8 h-8 mx-auto text-coral mb-2 animate-spin" />
          <p className="text-sm text-zinc-600">Afbeelding uploaden...</p>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          className="border-2 border-dashed border-zinc-300 rounded-lg p-6 text-center hover:border-coral/50 transition-colors"
        >
          <ImageIcon className="w-8 h-8 mx-auto text-zinc-400 mb-2" />
          <p className="text-sm text-zinc-600 mb-2">Sleep een afbeelding of</p>
          <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-coral text-white text-sm rounded-lg cursor-pointer hover:bg-coral/90">
            <Upload className="w-4 h-4" />
            Kies bestand
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            />
          </label>
          <p className="text-xs text-zinc-400 mt-2">Je kunt de afbeelding zelf positioneren</p>
          {error && <p className="text-red-600 text-xs mt-2">{error}</p>}
        </div>
      )}
    </div>
  );
}
