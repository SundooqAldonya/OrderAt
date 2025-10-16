// components/FileUpload.jsx
import React, { useState } from 'react'
import {
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
  Stack
} from '@mui/material'
import { useMutation, gql } from '@apollo/client'
import { createFoodByFile } from '../../apollo'

export default function MenuFileUpload() {
  const [file, setFile] = useState(null)
  const restaurantId = localStorage.getItem('restaurantId')

  const [mutateUploadExcel, { loading }] = useMutation(createFoodByFile, {
    onCompleted: res => {
      console.log({ res })
    },
    onError: err => {
      console.log({ err })
    }
  })

  const handleFileChange = e => {
    const selected = e.target.files[0]
    if (selected) setFile(selected)
  }

  const handleDrop = e => {
    e.preventDefault()
    if (e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file) return
    try {
      await mutateUploadExcel({
        variables: {
          file,
          restaurantId
        }
      })
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <Box maxWidth="500px" mx="auto" mt={4}>
      <Paper
        elevation={3}
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        sx={{
          p: 4,
          textAlign: 'center',
          border: '2px dashed #ccc',
          bgcolor: '#fafafa',
          cursor: 'pointer'
        }}
        onClick={() => document.getElementById('fileInput').click()}>
        <Typography variant="h6" gutterBottom sx={{ color: '#000' }}>
          Drag & Drop Excel file here
        </Typography>
        <Typography variant="body2" gutterBottom sx={{ color: '#000' }}>
          or click to browse
        </Typography>
        <input
          id="fileInput"
          type="file"
          accept=".xlsx"
          onChange={handleFileChange}
          hidden
        />
        {file && (
          <Typography mt={2} color="primary">
            Selected: {file.name}
          </Typography>
        )}
      </Paper>

      <Stack direction="row" justifyContent="center" mt={3}>
        <Button
          variant="contained"
          disabled={!file || loading}
          onClick={handleUpload}>
          {loading ? <CircularProgress size={24} /> : 'Upload'}
        </Button>
      </Stack>
    </Box>
  )
}
