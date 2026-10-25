/**
 * Builds start sessions for eval tasks that begin from an existing schema.
 * Run from the package root: `pnpm exec tsx evals/build-start-sessions.ts`.
 */
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { type AgentConstituentaPatch, RSToolAgent } from '../src';

interface StartSession {
  task: string;
  title: string;
  items: AgentConstituentaPatch[];
  /** Diagnostics names the start session must contain (empty — clean schema). */
  expectDiagnostics: string[];
}

const EVOLVE_TASKS: StartSession = {
  task: 'evolve-tasks',
  title: 'Задачи проекта',
  expectDiagnostics: [],
  items: [
    { alias: 'X1', term: 'задачи', convention: 'Задачи проекта, заведённые в трекере.' },
    { alias: 'X2', term: 'исполнители', convention: 'Сотрудники, которым можно назначать задачи.' },
    {
      alias: 'S1',
      term: 'назначения',
      definitionFormal: 'ℬ(X1×X2)',
      convention: 'Пара (задача, исполнитель): задача назначена исполнителю.'
    },
    {
      alias: 'S2',
      term: 'выполненные задачи',
      definitionFormal: 'ℬ(X1)',
      convention: 'Задачи, отмеченные в трекере как выполненные.'
    },
    {
      alias: 'D1',
      term: 'назначенные задачи',
      definitionFormal: 'Pr1(S1)',
      definitionText: 'Задачи, у которых есть исполнитель.'
    },
    {
      alias: 'D2',
      term: 'неназначенные задачи',
      definitionFormal: 'X1\\D1',
      definitionText: 'Задачи, у которых нет исполнителя.'
    },
    {
      alias: 'F1',
      term: 'задачи исполнителя',
      definitionFormal: '[ξ∈X2] Pr1(Fi2[{ξ}](S1))',
      definitionText: 'Задачи, назначенные данному исполнителю.'
    },
    {
      alias: 'F2',
      term: 'активные задачи исполнителя',
      definitionFormal: '[ξ∈X2] F1[ξ]\\S2',
      definitionText: 'Невыполненные задачи данного исполнителя.'
    },
    {
      alias: 'D3',
      term: 'задачи в работе',
      definitionFormal: 'D1\\S2',
      definitionText: 'Назначенные, но не выполненные задачи.'
    },
    {
      alias: 'A1',
      term: 'выполнять можно только назначенное',
      definitionFormal: 'S2⊆D1',
      definitionText: 'Каждая выполненная задача была назначена исполнителю.'
    },
    {
      alias: 'A2',
      term: 'один исполнитель у задачи',
      definitionFormal: 'card(S1)=card(Pr1(S1))',
      definitionText: 'У задачи не больше одного исполнителя.'
    }
  ]
};

const REVIEW_TOURNAMENT: StartSession = {
  task: 'review-tournament',
  title: 'Круговой турнир',
  expectDiagnostics: [],
  items: [
    { alias: 'X1', term: 'команды', convention: 'Команды, заявленные на турнир.' },
    { alias: 'X2', term: 'матчи', convention: 'Матчи турнира по календарю.' },
    {
      alias: 'C1',
      term: 'статусы матча',
      convention: 'Коды статуса матча: 0 — запланирован, 1 — сыгран, 2 — отменён.'
    },
    {
      alias: 'S1',
      term: 'календарь',
      definitionFormal: 'ℬ(X2×X1×X1)',
      convention: 'Тройка (матч, хозяева, гости) из календаря турнира.'
    },
    {
      alias: 'S2',
      term: 'статус матча',
      definitionFormal: 'ℬ(X2×C1)',
      convention: 'Пара (матч, код статуса).'
    },
    {
      alias: 'S3',
      term: 'победитель матча',
      definitionFormal: 'ℬ(X2×X1)',
      convention: 'Пара (матч, команда-победитель).'
    },
    {
      alias: 'S4',
      term: 'лидеры турнира',
      definitionFormal: 'ℬ(X1)',
      convention: 'Команды с наибольшим числом очков.'
    },
    {
      alias: 'D1',
      term: 'сыгранные матчи',
      definitionFormal: 'Pr1(S1)',
      definitionText: 'Матчи, которые состоялись.'
    },
    {
      alias: 'F1',
      term: 'очки команды',
      definitionFormal: '[ξ∈X1] card(Fi2[{ξ}](S1))',
      definitionText: 'Число очков, набранных командой в турнире.'
    },
    {
      alias: 'F2',
      term: 'победы команды',
      definitionFormal: '[ξ∈X1] Pr1(Fi2[{ξ}](S3))',
      definitionText: 'Матчи, в которых команда победила.'
    },
    {
      alias: 'A1',
      term: 'одна запись календаря на матч',
      definitionFormal: 'card(S1)=card(Pr1(S1))',
      definitionText: 'Каждый матч записан в календаре один раз.'
    },
    {
      alias: 'A2',
      term: 'один статус у матча',
      definitionFormal: 'card(S2)=card(Pr1(S2))',
      definitionText: 'У каждого матча не более одного статуса.'
    }
  ]
};

const FIX_ROUTES: StartSession = {
  task: 'fix-routes',
  title: 'Маршрутная сеть',
  expectDiagnostics: ['invalidFilterBooleanEchelon', 'invalidPropertyUsage'],
  items: [
    { alias: 'X1', term: 'остановки', convention: 'Остановки городского транспорта.' },
    { alias: 'X2', term: 'маршруты', convention: 'Маршруты городского транспорта.' },
    {
      alias: 'S1',
      term: 'остановки маршрута',
      definitionFormal: 'ℬ(X2×X1)',
      convention: 'Пара (маршрут, остановка): маршрут проходит через остановку.'
    },
    {
      alias: 'S2',
      term: 'перегоны',
      definitionFormal: 'ℬ(X1×X1)',
      convention: 'Пара (остановка, следующая остановка): между ними есть прямой перегон хотя бы одного маршрута.'
    },
    {
      alias: 'F1',
      term: 'соседние остановки',
      definitionFormal: '[ξ∈X1] Pr2(Fi1[{ξ}](S2))',
      definitionText: 'Остановки, до которых от данной есть прямой перегон.'
    },
    {
      alias: 'D1',
      term: 'пересадочные остановки',
      definitionFormal: 'D{ξ∈X1 | card(Pr1(Fi2[ξ](S1))) ≥ 2}',
      definitionText: 'Остановки, через которые проходят не меньше двух маршрутов.'
    },
    {
      alias: 'A1',
      term: 'связность сети',
      definitionFormal: '∀σ∈ℬ(X1) ((σ≠∅ & ∀ξ∈σ F1[ξ]⊆σ) ⇒ σ=X1)',
      definitionText: 'От любой остановки по перегонам можно доехать до любой другой.'
    },
    {
      alias: 'A2',
      term: 'каждая остановка обслуживается',
      definitionFormal: 'Pr2(S1)=X1',
      definitionText: 'Через каждую остановку проходит хотя бы один маршрут.'
    }
  ]
};

for (const start of [EVOLVE_TASKS, REVIEW_TOURNAMENT, FIX_ROUTES]) {
  const tool = new RSToolAgent();
  tool.createSession({ title: start.title });
  tool.applySchemaPatch({ items: start.items, mode: 'best_effort', commitMessage: 'start' });
  const names = tool
    .listDiagnostics()
    .map(diagnostic => diagnostic.name)
    .sort();
  const expected = [...start.expectDiagnostics].sort();
  if (JSON.stringify(names) !== JSON.stringify(expected)) {
    throw new Error(`${start.task}: diagnostics ${JSON.stringify(names)}, expected ${JSON.stringify(expected)}`);
  }
  const path = resolve(import.meta.dirname, 'tasks', start.task, 'given', 'start-session.json');
  writeFileSync(path, tool.exportSession() + '\n', 'utf8');
  console.log(`${start.task}: ${path}`);
}
