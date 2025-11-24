import { AppBar, Toolbar, Typography } from '@mui/material'
import React from 'react'

const Footer = () => {
  return (
    <AppBar
        position='fixed'
        sx={{
            top: "auto",
            bottom: 0,
            height: "45px",
            background: "#1976d2"
        }}
    >
        <Toolbar sx={{ justifyContent: "center"}}>
            <Typography variant='body2' pb="12px">
                &copy; {new Date().getFullYear()} Vyoobam Tech. All rights reserved. | Empowering Digital Solutions
            </Typography>
        </Toolbar>
    </AppBar>
  )
}

export default Footer