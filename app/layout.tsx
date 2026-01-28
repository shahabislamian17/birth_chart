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
        {/* Preload critical decorative images for faster loading */}
        <link
          rel="preload"
          as="image"
          href="https://production-chani-web-f5e5589aaeda.herokuapp.com/stickers/enter-butterfly.png"
          fetchPriority="high"
        />
        <link
          rel="preload"
          as="image"
          href="https://production-chani-web-f5e5589aaeda.herokuapp.com/stickers/star-1.png"
          fetchPriority="high"
        />
        <link
          rel="preload"
          as="image"
          href="https://production-chani-web-f5e5589aaeda.herokuapp.com/stickers/star-5.png"
          fetchPriority="high"
        />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}

