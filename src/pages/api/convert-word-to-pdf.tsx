import { NextApiRequest, NextApiResponse } from 'next'
import formidable from 'formidable'
import fs from 'fs'
import axios from 'axios'

export const config = {
  api: {
    bodyParser: false,
  },
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const form = formidable({
    maxFileSize: MAX_FILE_SIZE,
  })

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ message: 'Error parsing form data' })
    }

    // Check if files is an array or an object
    const fileArray = Array.isArray(files.file) ? files.file : [files.file]
    const file = fileArray[0]

    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' })
    }

    const filePath = file.filepath

    try {
      // Read the Word file
      const wordBuffer = await fs.promises.readFile(filePath)

      // Use an external API for Word to PDF conversion
      // Note: You'll need to replace 'YOUR_API_ENDPOINT' with an actual API that can convert Word to PDF
      const response = await axios.post('YOUR_API_ENDPOINT', wordBuffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        },
        responseType: 'arraybuffer',
      })

      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader('Content-Disposition', 'attachment; filename=converted.pdf')
      res.send(Buffer.from(response.data))
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: `Error converting Word to PDF: ${(error as Error).message}` })
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