# Next.js/TypeScript Best Practices

## Server/Client Boundaries

### ❌ Never Import Node.js APIs in Client Components

```typescript
// ❌ WRONG - Client component trying to use Node API
'use client'
import fs from 'fs'  // This will fail at runtime
import path from 'path'

export function MyComponent() {
  const files = fs.readdirSync('data')  // ERROR: Module not found
  return <div>{files}</div>
}
```

### ✅ Use API Routes for Server-Side Logic

```typescript
// ✅ CORRECT - API route for server-side logic
// app/api/files/route.ts
import fs from 'fs'
import { NextResponse } from 'next/server'

export async function GET() {
  const files = fs.readdirSync('data')
  return NextResponse.json(files)
}

// Client component fetches from API
'use client'
export function MyComponent() {
  const [files, setFiles] = useState<string[]>([])
  
  useEffect(() => {
    fetch('/api/files')
      .then(res => res.json())
      .then(setFiles)
  }, [])
  
  return <div>{files.join(', ')}</div>
}
```

## Build Artifacts

### Always Reference `dist/` in package.json Scripts

```json
// ✅ CORRECT - Reference build artifacts
{
  "scripts": {
    "build": "tsc",
    "doctor": "node dist/scripts/doctor/cli.js",
    "predoctor": "npm run build"
  }
}
```

### ❌ Don't Reference Source Files

```json
// ❌ WRONG - References source files
{
  "scripts": {
    "doctor": "node scripts/doctor/cli.ts"  // TypeScript not compiled
  }
}
```

## Type Safety

### Use Strict TypeScript

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true
  }
}
```

### ❌ Avoid `any` Types

```typescript
// ❌ WRONG - Using any
function processData(data: any) {
  return data.value
}

// ✅ CORRECT - Proper types
interface Data {
  value: number
}
function processData(data: Data): number {
  return data.value
}
```

## Environment Variables

### Use `NEXT_PUBLIC_` Prefix for Client-Side Variables

```typescript
// ✅ CORRECT - Client-side environment variable
const apiUrl = process.env.NEXT_PUBLIC_API_URL

// ❌ WRONG - Server-only variable in client component
const apiKey = process.env.API_KEY  // undefined in client
```

### Provide .env.local.example

```bash
# .env.local.example
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_API_KEY=demo-api-key
```

## API Client

### Create Type-Safe API Client

```typescript
// lib/api-client.ts
import axios from 'axios'
import { SimulationRequest, SimulationResponse } from '@/types/api'

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export async function simulate(
  request: SimulationRequest
): Promise<SimulationResponse> {
  const response = await apiClient.post<SimulationResponse>(
    '/api/v1/simulate',
    request
  )
  return response.data
}
```

## Error Handling

### Implement Error Boundaries

```typescript
// components/ErrorBoundary.tsx
'use client'

import React from 'react'
import { ErrorMessage } from './ErrorMessage'

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return <ErrorMessage error={this.state.error} />
    }
    return this.props.children
  }
}
```

## React Query Setup

### Configure Query Client

```typescript
// lib/react-query.ts
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})
```

### Use Custom Hooks

```typescript
// lib/hooks/use-simulation.ts
import { useMutation } from '@tanstack/react-query'
import { simulate } from '../api-endpoints'
import { SimulationRequest, SimulationResponse } from '@/types/api'

export function useSimulation() {
  return useMutation<SimulationResponse, Error, SimulationRequest>({
    mutationFn: simulate,
  })
}
```

## Performance

### Use Dynamic Imports for Heavy Components

```typescript
// ✅ CORRECT - Lazy load heavy components
import dynamic from 'next/dynamic'

const HeavyChart = dynamic(() => import('./HeavyChart'), {
  loading: () => <LoadingSpinner />,
  ssr: false, // Disable SSR if needed
})
```

### Optimize Images

```typescript
// ✅ CORRECT - Use Next.js Image component
import Image from 'next/image'

<Image
  src="/logo.png"
  alt="Logo"
  width={200}
  height={200}
  priority // For above-the-fold images
/>
```

## Checklist

Before committing Next.js/TypeScript code:

- [ ] No Node.js APIs in client components
- [ ] API routes for server-side logic
- [ ] Build scripts reference `dist/`
- [ ] Strict TypeScript enabled
- [ ] No `any` types
- [ ] `NEXT_PUBLIC_` prefix for client vars
- [ ] Error boundaries implemented
- [ ] Type-safe API client
- [ ] React Query configured
- [ ] Images optimized
- [ ] Dynamic imports for heavy components

