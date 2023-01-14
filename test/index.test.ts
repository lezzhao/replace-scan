import { describe, expect, it, test } from 'vitest'
import { transformContent } from '../src'

describe('replace file content', () => {
  it('simple file content replace test', async () => {
    const code = await transformContent(['**/fixture/*.css', '!**/index.css'], ['a', 'b'])
    expect(code).toMatchInlineSnapshot(`
      "@media screen (min-width: 680px) {
          aody {
              color: alue
          }
      }
      @media screen (min-width: 680px) {
          aody {
              color: yellow
          }
      }"
    `)
  })

  test.only('simple file regexp test', async () => {
    const code = await transformContent(['**/fixture/*.css', '!**/index.css'], [/@media\s*(\w+)*/, (_, body) => {
      console.log(body)
      return body
    }])
    expect(code).toMatchInlineSnapshot(`
      "@media screen (min-width: 680px) {
          aody {
              color: alue
          }
      }
      @media screen (min-width: 680px) {
          aody {
              color: yellow
          }
      }"
    `)
  })
})
