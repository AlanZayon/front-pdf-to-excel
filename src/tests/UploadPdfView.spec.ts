import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import UploadPdfView from '@/interfaces/views/UploadPdfView.vue'

describe('UploadPdfView', () => {
  it('renderiza o formulario de upload', () => {
    setActivePinia(createPinia())
    const wrapper = mount(UploadPdfView, {
      global: {
        stubs: {
          EditEmployeeModal: true,
          ProLaboreFields: true
        }
      }
    })

    expect(wrapper.text()).toContain('UPLOAD DE ARQUIVOS')
  })
})
