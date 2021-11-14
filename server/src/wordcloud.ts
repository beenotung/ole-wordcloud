import { getStopWords, splitChineseText } from 'meta-stopwords'
import { capitalize, ucfirst } from '@beenotung/tslib/string'
import { incMap, mapGetOrSetDefault } from '@beenotung/tslib'

type Word = {
  WORD: string
  count: number
  variants: Map<string, number>
}
type Item = {
  word: string
  weight: number
  count: number
}

const STOP_WORDS = new Set<string>()
getStopWords().forEach((word) => STOP_WORDS.add(word.toLocaleUpperCase()))

function takeTopVariant(variants: Map<string, number>): string {
  return Array.from(variants.entries()).sort((a, b) => b[1] - a[1])[0][0]
}

function scaleWeights(
  words: Word[],
  { maxSize, minSize }: { maxSize: number; minSize: number }
): Item[] {
  if (words.length === 0) {
    return []
  }
  let minWeight = Number.MAX_SAFE_INTEGER
  let maxWeight = Number.MIN_SAFE_INTEGER
  const items: Item[] = words.map((word): Item => {
    const weight = Math.log(word.count)
    minWeight = Math.min(minWeight, weight)
    maxWeight = Math.max(maxWeight, weight)
    return {
      word: takeTopVariant(word.variants),
      count: word.count,
      weight
    }
  })
  const weightRange = maxWeight - minWeight + 1
  const sizeRange = maxSize - minSize + 1
  items.forEach((item) => {
    item.weight =
      minSize + ((item.weight - minWeight) / weightRange) * sizeRange
  })
  return items
}

export function countWords(responses: string[]) {
  const minCount = 1
  const minSize = 16
  const maxSize = 32
  const maxWords = 500
  const wordMap = new Map<string, Word>()

  function countText(text: string) {
    const keywordFragments: string[] = []
    let rawFragments: string[] = [text]
    splitChineseText(text).forEach((keyword) => {
      const variants = [keyword, capitalize(keyword), ucfirst(keyword)]
      for (const keyword of variants) {
        const newRawFragments: string[] = []
        rawFragments.forEach((text) => {
          const parts = text.split(keyword)
          for (let i = 0; i < parts.length - 1; i++) {
            keywordFragments.push(keyword)
          }
          parts.forEach((word) => newRawFragments.push(word))
        })
        rawFragments = newRawFragments
      }
    })

    function eachWord(word: string) {
      if (word.length < 2) {
        return
      }
      const WORD = word.toLocaleUpperCase()
      if (STOP_WORDS.has(WORD)) {
        return
      }
      const item = mapGetOrSetDefault(
        wordMap,
        WORD,
        (): Word => ({
          WORD,
          count: 0,
          variants: new Map()
        })
      )
      item.count++
      incMap(item.variants, word)
    }

    keywordFragments.forEach(eachWord)
    rawFragments.forEach((text) => splitChineseText(text).forEach(eachWord))
  }

  responses.forEach(countText)

  let wordArray: Word[] = Array.from(wordMap.values())
  wordArray = wordArray
    .filter((item) => item.count >= minCount)
    .sort((a, b) => b.count - a.count)
    .slice(0, maxWords)
  const list = scaleWeights(wordArray, { minSize, maxSize })
  return list
}
