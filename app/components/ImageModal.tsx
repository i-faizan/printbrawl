'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'

interface Config {
  designA: { name: string; image: string; mockups: string[] }
  designB: { name: string; image: string; mockups: string[] }
}

interface ImageModalProps {
  modalOpen: boolean
  modalDesign: 'A' | 'B' | null
  selectedImageIndex: number
  config: Config
  onClose: () => void
  onImageSelect: (index: number) => void
}

export default function ImageModal({
  modalOpen,
  modalDesign,
  selectedImageIndex,
  config,
  onClose,
  onImageSelect
}: ImageModalProps) {
  // Handle keyboard navigation
  useEffect(() => {
    if (!modalOpen) return
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        const allImages = modalDesign === 'A' 
          ? [config.designA.image, ...(config.designA.mockups || [])]
          : [config.designB.image, ...(config.designB.mockups || [])]
        onImageSelect(selectedImageIndex > 0 ? selectedImageIndex - 1 : allImages.length - 1)
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        const allImages = modalDesign === 'A' 
          ? [config.designA.image, ...(config.designA.mockups || [])]
          : [config.designB.image, ...(config.designB.mockups || [])]
        onImageSelect(selectedImageIndex < allImages.length - 1 ? selectedImageIndex + 1 : 0)
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [modalOpen, modalDesign, selectedImageIndex, config, onClose, onImageSelect])

  if (!modalOpen || !modalDesign) return null

  const allImages = modalDesign === 'A' 
    ? [config.designA.image, ...(config.designA.mockups || [])]
    : [config.designB.image, ...(config.designB.mockups || [])]

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="relative max-w-6xl w-full max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 rounded-full bg-white/10 hover:bg-white/20 p-3 backdrop-blur transition"
        >
          <X className="h-6 w-6 text-white" />
        </button>

        {/* Main Image Display */}
        <div className="mb-6 rounded-2xl overflow-hidden bg-white/5 border border-white/10">
          <img
            src={allImages[selectedImageIndex] || allImages[0]}
            alt={modalDesign === 'A' ? config.designA.name : config.designB.name}
            className="w-full h-auto object-contain max-h-[70vh] mx-auto"
          />
        </div>

        {/* Thumbnail Gallery */}
        {allImages.length > 1 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {allImages.map((mockup, index) => (
              <button
                key={index}
                onClick={() => onImageSelect(index)}
                className={`relative aspect-[3/4] rounded-xl overflow-hidden border-2 transition ${
                  selectedImageIndex === index 
                    ? 'border-blue-500 ring-2 ring-blue-500/50' 
                    : 'border-white/20 hover:border-white/40'
                }`}
              >
                <img
                  src={mockup}
                  alt={`${modalDesign === 'A' ? config.designA.name : config.designB.name} ${index === 0 ? 'main' : 'mockup ' + index}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

