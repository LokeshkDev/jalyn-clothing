import { useState, useEffect } from 'react'
import api from '../services/api'

export function useCmsApi() {
  const [cmsData, setCmsData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function fetchCms() {
      try {
        const response = await api.get('/cms/homepage')
        if (isMounted && response.data?.data) {
          setCmsData(response.data.data)
        }
      } catch (err) {
        console.warn('Using client preset defaults for CMS:', err.message)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchCms()

    return () => {
      isMounted = false
    }
  }, [])

  return { cmsData, loading }
}
