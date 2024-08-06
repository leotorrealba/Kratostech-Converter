import { NextApiRequest, NextApiResponse } from 'next'
import formidable from 'formidable'
import fs from 'fs'
import axios from 'axios'
import { Readable } from 'stream'

// Configuración para permitir el parsing del body de la solicitud
export const config = {
  api: {
    bodyParser: false,
  },
}

// Tamaño máximo de archivo (10 MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024

// Función para convertir un ReadableStream a un Buffer
async function streamToBuffer(stream: Readable): Promise<Buffer> {
  const chunks = []
  for await (const chunk of stream) {
    chunks.push(chunk)
  }
  return Buffer.concat(chunks)
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Verificar si el método de la solicitud es POST
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  // Crear una nueva instancia de formidable para manejar la carga de archivos
  const form = new formidable.IncomingForm({
    maxFileSize: MAX_FILE_SIZE,
  })

  try {
    // Parsear la solicitud
    const [fields, files] = await new Promise<[formidable.Fields, formidable.Files]>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err)
        resolve([fields, files])
      })
    })

    // Verificar si se ha subido un archivo
    const file = files.file as formidable.File
    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' })
    }

    // Leer el archivo
    const fileContent = await fs.promises.readFile(file.filepath)

    // Configurar la solicitud al servicio de conversión
    const conversionServiceUrl = process.env.CONVERSION_SERVICE_URL
    if (!conversionServiceUrl) {
      throw new Error('Conversion service URL is not configured')
    }

    // Realizar la solicitud al servicio de conversión
    const response = await axios.post(conversionServiceUrl, fileContent, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Accept': 'application/pdf',
      },
      responseType: 'stream',
    })

    // Convertir el stream de respuesta a un buffer
    const pdfBuffer = await streamToBuffer(response.data)

    // Configurar los headers de la respuesta
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename=${file.originalFilename?.replace('.docx', '.pdf') || 'converted.pdf'}`)

    // Enviar el PDF convertido como respuesta
    res.send(pdfBuffer)
  } catch (error) {
    console.error('Error converting Word to PDF:', error)
    if (error instanceof Error) {
      if (error.message === 'Conversion service URL is not configured') {
        return res.status(500).json({ message: 'Server configuration error' })
      }
      if (error.message.includes('maxFileSize exceeded')) {
        return res.status(413).json({ message: `File size exceeds the limit of ${MAX_FILE_SIZE / (1024 * 1024)} MB` })
      }
    }
    res.status(500).json({ message: 'Error converting Word to PDF' })
  } finally {
    // Limpiar archivos temporales
    const file = (files as formidable.Files).file as formidable.File
    if (file && file.filepath) {
      fs.unlink(file.filepath, (err) => {
        if (err) console.error('Error deleting temporary file:', err)
      })
    }
  }
}