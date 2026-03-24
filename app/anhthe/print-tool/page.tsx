import { Metadata } from 'next'
import PrintTool from './components/PrintTool'

export const metadata: Metadata = {
  title: 'In ảnh thẻ — Canon Selphy CP1300 | Tulie Studio',
  description: 'Công cụ in ảnh thẻ nội bộ: crop, chỉnh màu, xếp vỉ in, export JPEG cho Canon Selphy CP1300.',
}

export default function PrintToolPage() {
  return <PrintTool />
}
