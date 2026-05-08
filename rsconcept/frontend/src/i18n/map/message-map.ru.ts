import { txGeneralRu } from '../app/general.ru';
import { txShellRu } from '../app/shell.ru';
import { txAiRu } from '../domain/ai.ru';
import { txLangRu } from '../domain/lang.ru';
import { txLibraryRu } from '../domain/library.ru';
import { txRslangRu } from '../domain/rslang.ru';
export const ruMessageMap: Record<string, string> = {
  ...txGeneralRu,
  ...txLibraryRu,
  ...txLangRu,
  ...txRslangRu,
  ...txShellRu,
  ...txAiRu
};
