import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    version: '1.0.1', // Update this when you deploy
    deployedAt: new Date().toISOString(),
    features: {
      excludeOriginalPdf: true,
      debugEndpoint: true,
      jumpToLine: true,
    },
    environment: {
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
      vercelGitCommitSha: process.env.VERCEL_GIT_COMMIT_SHA,
      vercelGitCommitMessage: process.env.VERCEL_GIT_COMMIT_MESSAGE,
    }
  })
}