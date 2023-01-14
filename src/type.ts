export enum ActionFlag {
  REPLACE = 1, // replace string
  SUPPLEMENT = 1 << 2, // insert string after specific position
  GENERATE = 1 << 3, // genearte new file
}

export type Target = string | string[]

export type RuleTuple = [string | RegExp, ((...args: any) => string) | string]
export type ReplaceRules = RuleTuple[] | RuleTuple

export interface ExtraOptions {
  action?: ActionFlag
}
