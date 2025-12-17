import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import React from 'react'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Birth Chart Tool',
  description: 'Input your birth info to get a snapshot of the sky the moment you were born.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://use.typekit.net/umw2scb.css" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}

