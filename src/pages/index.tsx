import React, { useState } from 'react'
import Head from 'next/head'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB

interface HomeProps {
  locale: string
  setLocale: (locale: string) => void
}

export default function Home({ locale, setLocale }: HomeProps) {
  const [file, setFile] = useState<File | null>(null)
  const [convertedFile, setConvertedFile] = useState<string | null>(null)
  const [conversionType, setConversionType] = useState('image')
  const [outputFormat, setOutputFormat] = useState('webp')
  const [quality, setQuality] = useState(80)
  const [threshold, setThreshold] = useState(128)
  const [turdSize, setTurdSize] = useState(2)
  const [alphaMax, setAlphaMax] = useState(1)
  const [optCurve, setOptCurve] = useState(true)
  const [optTolerance, setOptTolerance] = useState(0.2)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      if (selectedFile.size > MAX_FILE_SIZE) {
        setError(`El archivo es demasiado grande. El tamaño máximo es ${MAX_FILE_SIZE / (1024 * 1024)} MB.`)
        setFile(null)
      } else {
        setFile(selectedFile)
        setError(null)
      }
    }
  }

  const handleConvert = async () => {
    if (!file) {
      setError('Por favor, selecciona un archivo primero.')
      return
    }

    setIsLoading(true)
    setError(null)
    setProgress(0)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('outputFormat', outputFormat)
    formData.append('quality', quality.toString())
    formData.append('threshold', threshold.toString())
    formData.append('turdSize', turdSize.toString())
    formData.append('alphaMax', alphaMax.toString())
    formData.append('optCurve', optCurve.toString())
    formData.append('optTolerance', optTolerance.toString())

    let apiEndpoint = ''
    switch (conversionType) {
      case 'image':
        apiEndpoint = '/api/convert-image'
        break
      case 'pdfToWord':
        apiEndpoint = '/api/convert-pdf-to-word'
        break
      case 'wordToPdf':
        apiEndpoint = '/api/convert-word-to-pdf'
        break
      default:
        setError('Tipo de conversión no válido')
        setIsLoading(false)
        return
    }

    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`)
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      setConvertedFile(url)
    } catch (err) {
      setError(`Error al convertir el archivo: ${(err as Error).message}`)
    } finally {
      setIsLoading(false)
      setProgress(100)
    }
  }

  const renderImageOptions = () => (
    <>
      <div>
        <Label htmlFor="output-format">Formato de salida</Label>
        <Select value={outputFormat} onValueChange={setOutputFormat}>
          <SelectTrigger id="output-format">
            <SelectValue placeholder="Selecciona un formato" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="webp">WebP</SelectItem>
            <SelectItem value="svg">SVG</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {outputFormat === 'webp' && (
        <div>
          <Label htmlFor="quality">Calidad WebP: {quality}</Label>
          <Slider
            id="quality"
            min={0}
            max={100}
            step={1}
            value={[quality]}
            onValueChange={(value) => setQuality(value[0])}
          />
        </div>
      )}
      {outputFormat === 'svg' && (
        <>
          <div>
            <Label htmlFor="threshold">Umbral: {threshold}</Label>
            <Slider
              id="threshold"
              min={0}
              max={255}
              step={1}
              value={[threshold]}
              onValueChange={(value) => setThreshold(value[0])}
            />
          </div>
          <div>
            <Label htmlFor="turdSize">Tamaño mínimo de área: {turdSize}</Label>
            <Slider
              id="turdSize"
              min={0}
              max={100}
              step={1}
              value={[turdSize]}
              onValueChange={(value) => setTurdSize(value[0])}
            />
          </div>
          <div>
            <Label htmlFor="alphaMax">Ángulo máximo de esquina: {alphaMax.toFixed(2)}</Label>
            <Slider
              id="alphaMax"
              min={0}
              max={1.33}
              step={0.01}
              value={[alphaMax]}
              onValueChange={(value) => setAlphaMax(value[0])}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="optCurve"
              checked={optCurve}
              onCheckedChange={setOptCurve}
            />
            <Label htmlFor="optCurve">Optimizar curvas</Label>
          </div>
          <div>
            <Label htmlFor="optTolerance">Tolerancia de optimización: {optTolerance.toFixed(2)}</Label>
            <Slider
              id="optTolerance"
              min={0}
              max={1}
              step={0.01}
              value={[optTolerance]}
              onValueChange={(value) => setOptTolerance(value[0])}
            />
          </div>
        </>
      )}
    </>
  )

  return (
    <div className="flex flex-col min-h-screen bg-gray-light">
      <Head>
        <title>Convertidor de Archivos</title>
        <link rel="icon" href="/favicon.svg" />
      </Head>

      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-center text-navy">Convertidor de Archivos</h1>
        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="image" onValueChange={(value) => setConversionType(value as string)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="image">Imagen</TabsTrigger>
              <TabsTrigger value="pdfToWord">PDF a Word</TabsTrigger>
              <TabsTrigger value="wordToPdf">Word a PDF</TabsTrigger>
            </TabsList>
            <TabsContent value="image">
              <Card>
                <CardHeader>
                  <CardTitle>Convertir Imagen</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="image-upload">Seleccionar imagen</Label>
                      <Input id="image-upload" type="file" accept=".jpg,.jpeg,.png" onChange={handleFileChange} />
                      <p className="text-sm text-gray-500 mt-1">Tamaño máximo: {MAX_FILE_SIZE / (1024 * 1024)} MB</p>
                    </div>
                    {renderImageOptions()}
                    <Button onClick={handleConvert} disabled={isLoading || !file}>
                      {isLoading ? 'Convirtiendo...' : 'Convertir'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="pdfToWord">
              <Card>
                <CardHeader>
                  <CardTitle>Convertir PDF a Word</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="pdf-upload">Seleccionar PDF</Label>
                      <Input id="pdf-upload" type="file" accept=".pdf" onChange={handleFileChange} />
                      <p className="text-sm text-gray-500 mt-1">Tamaño máximo: {MAX_FILE_SIZE / (1024 * 1024)} MB</p>
                    </div>
                    <Button onClick={handleConvert} disabled={isLoading || !file}>
                      {isLoading ? 'Convirtiendo...' : 'Convertir a Word'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="wordToPdf">
              <Card>
                <CardHeader>
                  <CardTitle>Convertir Word a PDF</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="word-upload">Seleccionar Word</Label>
                      <Input id="word-upload" type="file" accept=".docx" onChange={handleFileChange} />
                      <p className="text-sm text-gray-500 mt-1">Tamaño máximo: {MAX_FILE_SIZE / (1024 * 1024)} MB</p>
                    </div>
                    <Button onClick={handleConvert} disabled={isLoading || !file}>
                      {isLoading ? 'Convirtiendo...' : 'Convertir a PDF'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {isLoading && (
            <Card className="mt-4">
              <CardContent>
                <h3 className="text-lg font-semibold mb-2">Progreso de la conversión</h3>
                <Progress value={progress} className="w-full" />
              </CardContent>
            </Card>
          )}
          {convertedFile && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Archivo Convertido</CardTitle>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full bg-orange text-white hover:bg-opacity-80">
                  <a href={convertedFile} download={`converted_file.${conversionType === 'pdfToWord' ? 'docx' : conversionType === 'wordToPdf' ? 'pdf' : outputFormat}`}>
                    Descargar Archivo Convertido
                  </a>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}

export async function getServerSideProps(context: { locale: string }) {
  return {
    props: {
      locale: context.locale || 'en',
    },
  }
}