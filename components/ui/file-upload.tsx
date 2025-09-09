import * as React from "react"
import { Upload, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { STLViewer } from "./stl-viewer"

export interface FileUploadProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  onFileSelect?: (file: File | null) => void
  selectedFile?: File | null
  generatedModel?: {
    stlUrl: string;
    stlFileName: string;
    imageUrl: string;
  } | null
  onThumbnailReady?: (dataUrl: string) => void
  isProcessing?: boolean
  progress?: number
}

const FileUpload = React.forwardRef<HTMLInputElement, FileUploadProps>(
  ({ className, onFileSelect, onChange, selectedFile, generatedModel, onThumbnailReady, isProcessing, progress, ...props }, ref) => {
    const [previewUrl, setPreviewUrl] = React.useState<string | null>(null)
    const [currentQuoteIndex, setCurrentQuoteIndex] = React.useState(0)
    const inputRef = React.useRef<HTMLInputElement>(null)

    const funQuotes = [
      "🎨 Turning your selfie into art...",
      "🔮 Working some 3D magic...", 
      "🚀 Launching you into the third dimension...",
      "⚡ Zapping pixels into polygons...",
      "🎭 Sculpting your digital twin...",
      "🌟 Making you legendary in 3D...",
      "🎪 The greatest show in 3D is loading...",
      "🎯 Precision crafting your mini-me...",
      "🎨 Picasso wishes he could do this...",
      "🔥 Your 3D model is going to be fire...",
      "✨ Sprinkling some 3D fairy dust...",
      "🎪 Step right up to see yourself in 3D...",
    ]

    React.useEffect(() => {
      if (selectedFile) {
        const url = URL.createObjectURL(selectedFile)
        setPreviewUrl(url)
        return () => URL.revokeObjectURL(url)
      } else {
        setPreviewUrl(null)
      }
    }, [selectedFile])

    // Rotate quotes during processing
    React.useEffect(() => {
      if (isProcessing) {
        const interval = setInterval(() => {
          setCurrentQuoteIndex(prev => (prev + 1) % funQuotes.length)
        }, 2000) // Change quote every 2 seconds
        return () => clearInterval(interval)
      }
    }, [isProcessing, funQuotes.length])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] || null
      onFileSelect?.(file)
      onChange?.(e)
    }

    const handleReset = (e: React.MouseEvent) => {
      e.stopPropagation()
      e.preventDefault()
      onFileSelect?.(null)
      if (inputRef.current) {
        inputRef.current.value = ''
      }
    }

    React.useImperativeHandle(ref, () => inputRef.current!, [])

    // Show 3D model if generated, otherwise show image preview, otherwise show upload interface
    if (generatedModel) {
      return (
        <div className="relative">
          <div
            className={cn(
              "w-full h-[30vh] bg-[#FAFBFC] border border-[rgba(27,31,35,0.15)] rounded-md overflow-hidden relative",
              className
            )}
          >
            <STLViewer 
              stlUrl={generatedModel.stlUrl} 
              className="w-full h-full"
              onThumbnailReady={onThumbnailReady}
            />
            <button
              onClick={handleReset}
              className="absolute top-2 left-2 w-6 h-6 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-colors z-20"
              type="button"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      )
    }

    if (selectedFile && previewUrl) {
      return (
        <div className="relative">
          <div
            className={cn(
              "w-full bg-[#FAFBFC] border border-[rgba(27,31,35,0.15)] rounded-md overflow-hidden relative",
              className
            )}
          >
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-auto object-contain"
            />
            
            {/* Loading overlay during processing */}
            {isProcessing && (
              <div className="absolute inset-0 bg-gradient-to-br from-[#466F80]/90 via-[#5a7d95]/85 to-[#466F80]/90 flex flex-col items-center justify-center text-white">
                {/* Animated progress bar */}
                <div className="w-3/4 mb-6">
                  <div className="bg-white/20 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-white h-full rounded-full transition-all duration-300 ease-out shadow-lg"
                      style={{ width: `${progress || 0}%` }}
                    />
                  </div>
                  <div className="text-center mt-2 text-sm font-medium opacity-80">
                    {Math.round(progress || 0)}%
                  </div>
                </div>
                
                {/* Rotating fun quotes */}
                <div className="text-center px-4 max-w-xs">
                  <div 
                    key={currentQuoteIndex}
                    className="text-lg font-semibold animate-pulse"
                  >
                    {funQuotes[currentQuoteIndex]}
                  </div>
                </div>
                
                {/* Animated spinner */}
                <div className="mt-6">
                  <div className="w-8 h-8 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                </div>
              </div>
            )}
            
            <button
              onClick={handleReset}
              className={cn(
                "absolute top-2 left-2 w-6 h-6 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-colors z-20",
                isProcessing && "opacity-50 pointer-events-none"
              )}
              type="button"
              disabled={isProcessing}
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      )
    }

    return (
      <div className="relative">
        <input
          type="file"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          onChange={handleChange}
          ref={inputRef}
          {...props}
        />
        <div
          className={cn(
            "w-full h-[30vh] appearance-none bg-[#FAFBFC] border border-[rgba(27,31,35,0.15)] cursor-pointer font-medium relative transition-[background-color_0.2s_cubic-bezier(0.3,0,0.5,1)] touch-manipulation shadow-[rgba(27,31,35,0.04)_0_1px_0,rgba(255,255,255,0.25)_0_1px_0_inset] hover:bg-[#F3F4F6] hover:duration-100 disabled:bg-[#FAFBFC] disabled:border-[rgba(27,31,35,0.15)] disabled:cursor-not-allowed focus-within:bg-white focus-within:border-[#0969da] focus-within:shadow-[0_0_0_3px_rgba(9,105,218,0.3)] rounded-md flex flex-col items-center justify-center gap-2",
            className
          )}
        >
          <Upload className="w-8 h-8 text-[#959DA5]" />
          <span className="text-sm text-[#959DA5]">Click to upload</span>
        </div>
      </div>
    )
  }
)
FileUpload.displayName = "FileUpload"

export { FileUpload }
