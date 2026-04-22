import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ContextProvider, ContextProviderHeart, ContextProviderDarklight, RefreshTableProvider, SidebarProvider } from './AllContext/context.tsx'; // ✅ Capitalized import

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ContextProvider>
      <ContextProviderHeart>
        <ContextProviderDarklight>
          <RefreshTableProvider>
            <SidebarProvider>
              <App />
            </SidebarProvider>
          </RefreshTableProvider>
        </ContextProviderDarklight>
      </ContextProviderHeart>
    </ContextProvider>
  </StrictMode>,
)
