import { useState, useEffect } from 'react'

export function useProducts() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch('/data/products.json')
      .then(r => {
        if (!r.ok) throw new Error('HTTP ' + r.status)
        return r.json()
      })
      .then(data => {
        setProducts((data.products || []).filter(p => p.available))
        setCategories(data.categories || [])
        setLoading(false)
      })
      .catch(err => {
        console.error('useProducts:', err)
        setError(err.message)
        setLoading(false)
      })
  }, [])

  return { products, categories, loading, error }
}
