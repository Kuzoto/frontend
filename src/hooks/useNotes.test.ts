import { describe, it, expect } from 'vitest'
import { noteKeys, labelKeys } from './useNotes'

describe('noteKeys', () => {
  it('generates correct all key', () => {
    expect(noteKeys.all).toEqual(['notes'])
  })

  it('generates correct list key with params', () => {
    const params = { search: 'test', archived: false }
    expect(noteKeys.list(params)).toEqual(['notes', 'list', params])
  })

  it('generates correct detail key', () => {
    expect(noteKeys.detail('123')).toEqual(['notes', 'detail', '123'])
  })
})

describe('labelKeys', () => {
  it('generates correct all key', () => {
    expect(labelKeys.all).toEqual(['labels'])
  })
})
