import { NextApiRequest, NextApiResponse } from 'next'
import formidable from 'formidable'
import fs from 'fs'
import path from 'path'
import sharp from 'sharp'
import potrace from 'potrace'
import { promisify } from 'util'

export const config = {
  api: {
    bodyParser: false,
  },
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB

// Especifica el tipo de retorno de potraceTrace
const potraceTrace = promisify<Buffer, potrace.PotraceOptions, string>(potrace.trace)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const form = formidable({
    maxFileSize: MAX_FILE_SIZE,
  })

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Error parsing form:', err)
      return res.status(500).json({ message: 'Error parsing form data' })
    }

    const file = files.file as formidable.File
    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' })
    }

    const filePath = file.filepath
    const fileName = file.originalFilename || 'converted'
    const outputFormat = fields.outputFormat as string
    const quality = parseInt(fields.quality as string, 10) || 80
    const threshold = parseInt(fields.threshold as string, 10) || 128
    const turdSize = parseInt(fields.turdSize as string, 10) || 2
    const alphaMax = parseFloat(fields.alphaMax as string) || 1
    const optCurve = fields.optCurve === 'true'
    const optTolerance = parseFloat(fields.optTolerance as string) || 0.2

    try {
      const image = sharp(filePath)
      const metadata = await image.metadata()

      if (!metadata.format || !['jpeg', 'jpg', 'png'].includes(metadata.format)) {
        throw new Error('Unsupported input file format. Only JPG, JPEG, and PNG are supported.')
      }

      let output: Buffer
      let contentType: string

      if (outputFormat === 'webp') {
        output = await image.webp({ quality }).toBuffer()
        contentType = 'image/webp'
      } else if (outputFormat === 'svg') {
        const bwImage = await image.greyscale().threshold(threshold).png().toBuffer()
        try {
          const svg = await potraceTrace(bwImage, {
            turdSize: turdSize,
            alphaMax: alphaMax,
            optCurve: optCurve,
            optTolerance: optTolerance,
            threshold: threshold,
            blackOnWhite: true,
            color: '#000000',
            background: '#FFFFFF',
          })
          output = Buffer.from(svg as string)
          contentType = 'image/svg+xml'
        } catch (traceError) {
          console.error('Error tracing image:', traceError)
          throw new Error('Failed to convert image to SVG')
        }
      } else {
        throw new Error('Unsupported output format')
      }

      res.setHeader('Content-Type', contentType)
      res.setHeader('Content-Disposition', `attachment; filename=${path.parse(fileName).name}.${outputFormat}`)
      res.send(output)
    } catch (error) {
      console.error('Error converting image:', error)
      res.status(500).json({ message: `Error converting image: ${(error as Error).message}` })
    } finally {
      // Clean up the temporary file
      fs.unlink(filePath, (unlinkError) => {
        if (unlinkError) {
          console.error('Error deleting temporary file:', unlinkError)
        }
      })
    }
  })
}