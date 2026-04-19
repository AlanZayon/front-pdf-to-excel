import { mount } from '@vue/test-utils'
import UploadPdfView from '@/interfaces/views/UploadPdfView.vue'
import { describe, it, expect } from 'vitest'

describe('UploadPdfView', () => {
  it('renderiza o formulario de upload', () => {
    const wrapper = mount(UploadPdfView)
    expect(wrapper.text()).toContain('UPLOAD DE ARQUIVOS')
  })
})
