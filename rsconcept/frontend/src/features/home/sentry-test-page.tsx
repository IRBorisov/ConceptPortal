'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';

import { useTx } from '@/i18n';
import { isSentryEnabled, Sentry } from '@/services/sentry';

import { Button } from '@/components/control';
import { buildConstants } from '@/utils/build-constants';

function BrokenRenderProbe(): never {
  throw new Error('Sentry test: React render error');
}

export function Component() {
  const tx = useTx();
  const sentryEnabled = isSentryEnabled();
  const [showBrokenRender, setShowBrokenRender] = useState(false);

  function throwSyncError() {
    throw new Error('Sentry test: synchronous error');
  }

  function throwAsyncError() {
    setTimeout(function throwInTimeout() {
      throw new Error('Sentry test: async error in setTimeout');
    }, 0);
  }

  function throwUnhandledRejection() {
    void Promise.reject(new Error('Sentry test: unhandled promise rejection'));
  }

  function throwTypeError() {
    const value: { nested?: { field: string } } = {};

    value.nested!.field.toLowerCase();
  }

  function throwReferenceError() {
    setTimeout(function throwReferenceErrorInTimeout() {
      // @ts-expect-error intentional test error
      void missingSentryTestVariable;
    }, 0);
  }

  function captureManualException() {
    Sentry.captureException(new Error('Sentry test: manually captured exception'));
  }

  function captureMessage() {
    Sentry.captureMessage('Sentry test: captured info message', 'info');
  }

  function captureWarningMessage() {
    Sentry.captureMessage('Sentry test: captured warning message', 'warning');
  }

  function logStructuredMessage() {
    Sentry.logger.error('Sentry test: structured log message', {
      source: 'sentry-test-page',
      kind: 'structured-log'
    });
  }

  async function captureHttpError() {
    const response = await fetch(`${buildConstants.backend}/api/sentry-test-404`);
    if (!response.ok) {
      Sentry.captureException(new Error(`Sentry test: HTTP ${response.status} from ${response.url}`));
    }
  }

  function captureWithContext() {
    Sentry.withScope(scope => {
      scope.setTag('sentry_test', 'context');
      scope.setExtra('trigger', 'sentry-test-page');
      scope.setUser({ id: 'sentry-test-user', username: 'sentry-tester' });
      Sentry.captureException(new Error('Sentry test: error with custom context'));
    });
  }

  function addBreadcrumbAndError() {
    Sentry.addBreadcrumb({
      category: 'sentry-test',
      message: 'User opened breadcrumb test',
      level: 'info'
    });
    Sentry.addBreadcrumb({
      category: 'sentry-test',
      message: 'User triggered breadcrumb test error',
      level: 'warning'
    });
    Sentry.captureException(new Error('Sentry test: error with breadcrumbs'));
  }

  function queueSentryTest(label: string, action: () => void | Promise<void>) {
    toast.info(tx('tx.shell.sentry.test.toast.sent', { label }));
    void Promise.resolve().then(action);
  }

  const tests = [
    {
      id: 'sync',
      text: tx('tx.shell.sentry.test.syncError'),
      title: tx('tx.shell.sentry.test.syncError.hint'),
      onClick: () => queueSentryTest(tx('tx.shell.sentry.test.syncError'), throwSyncError)
    },
    {
      id: 'async',
      text: tx('tx.shell.sentry.test.asyncError'),
      title: tx('tx.shell.sentry.test.asyncError.hint'),
      onClick: () => queueSentryTest(tx('tx.shell.sentry.test.asyncError'), throwAsyncError)
    },
    {
      id: 'rejection',
      text: tx('tx.shell.sentry.test.unhandledRejection'),
      title: tx('tx.shell.sentry.test.unhandledRejection.hint'),
      onClick: () => queueSentryTest(tx('tx.shell.sentry.test.unhandledRejection'), throwUnhandledRejection)
    },
    {
      id: 'type',
      text: tx('tx.shell.sentry.test.typeError'),
      title: tx('tx.shell.sentry.test.typeError.hint'),
      onClick: () => queueSentryTest(tx('tx.shell.sentry.test.typeError'), throwTypeError)
    },
    {
      id: 'reference',
      text: tx('tx.shell.sentry.test.referenceError'),
      title: tx('tx.shell.sentry.test.referenceError.hint'),
      onClick: () => queueSentryTest(tx('tx.shell.sentry.test.referenceError'), throwReferenceError)
    },
    {
      id: 'render',
      text: tx('tx.shell.sentry.test.renderError'),
      title: tx('tx.shell.sentry.test.renderError.hint'),
      onClick: () =>
        queueSentryTest(tx('tx.shell.sentry.test.renderError'), () => {
          setShowBrokenRender(true);
        }),
      disabled: showBrokenRender
    },
    {
      id: 'exception',
      text: tx('tx.shell.sentry.test.manualException'),
      title: tx('tx.shell.sentry.test.manualException.hint'),
      onClick: () => queueSentryTest(tx('tx.shell.sentry.test.manualException'), captureManualException)
    },
    {
      id: 'message',
      text: tx('tx.shell.sentry.test.captureMessage'),
      title: tx('tx.shell.sentry.test.captureMessage.hint'),
      onClick: () => queueSentryTest(tx('tx.shell.sentry.test.captureMessage'), captureMessage)
    },
    {
      id: 'warning',
      text: tx('tx.shell.sentry.test.captureWarning'),
      title: tx('tx.shell.sentry.test.captureWarning.hint'),
      onClick: () => queueSentryTest(tx('tx.shell.sentry.test.captureWarning'), captureWarningMessage)
    },
    {
      id: 'log',
      text: tx('tx.shell.sentry.test.structuredLog'),
      title: tx('tx.shell.sentry.test.structuredLog.hint'),
      onClick: () => queueSentryTest(tx('tx.shell.sentry.test.structuredLog'), logStructuredMessage)
    },
    {
      id: 'http',
      text: tx('tx.shell.sentry.test.httpError'),
      title: tx('tx.shell.sentry.test.httpError.hint'),
      onClick: () => queueSentryTest(tx('tx.shell.sentry.test.httpError'), captureHttpError)
    },
    {
      id: 'context',
      text: tx('tx.shell.sentry.test.withContext'),
      title: tx('tx.shell.sentry.test.withContext.hint'),
      onClick: () => queueSentryTest(tx('tx.shell.sentry.test.withContext'), captureWithContext)
    },
    {
      id: 'breadcrumb',
      text: tx('tx.shell.sentry.test.breadcrumbError'),
      title: tx('tx.shell.sentry.test.breadcrumbError.hint'),
      onClick: () => queueSentryTest(tx('tx.shell.sentry.test.breadcrumbError'), addBreadcrumbAndError)
    }
  ] as const;

  return (
    <div className='mx-auto flex max-w-3xl flex-col gap-6 px-6 py-8'>
      <header className='flex flex-col gap-2'>
        <h1>{tx('tx.shell.sentry.test.title')}</h1>
        <p className='text-muted-foreground'>{tx('tx.shell.sentry.test.intro')}</p>
        <p className={sentryEnabled ? 'text-green-700 dark:text-green-400' : 'text-amber-700 dark:text-amber-400'}>
          {sentryEnabled ? tx('tx.shell.sentry.test.enabled') : tx('tx.shell.sentry.test.disabled')}
        </p>
      </header>

      <div className='grid gap-3 sm:grid-cols-2'>
        {tests.map(test => (
          <Button
            key={test.id}
            text={test.text}
            title={test.title}
            className='justify-start'
            onClick={test.onClick}
            disabled={!sentryEnabled || ('disabled' in test && test.disabled)}
          />
        ))}
      </div>

      {showBrokenRender ? <BrokenRenderProbe /> : null}
    </div>
  );
}
