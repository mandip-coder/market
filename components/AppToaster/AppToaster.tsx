import { ToastContainer, toast } from 'react-toastify'
import { useThemeContext } from '@/context/ThemeContextProvider'
import 'react-toastify/dist/ReactToastify.css'

export default function AppToaster() {
  const { themeMode } = useThemeContext()

  return (
    <ToastContainer
      position="top-center"
      autoClose={2000}
      hideProgressBar={true}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme={themeMode}
    />
  )
}

export { toast }
