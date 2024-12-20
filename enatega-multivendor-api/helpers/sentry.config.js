const Sentry = require('@sentry/node')

module.exports = {
  SentryConfig: {
    // server lifecycle event
    requestDidStart(_) {
      /* Within this returned object, define functions that respond
             to request-specific lifecycle events. */
      return {
        didEncounterErrors(ctx) {
          // If we couldn't parse the operation (usually invalid queries)
          if (!ctx.operation) {
            for (const err of ctx.errors) {
              Sentry.withScope(scope => {
                scope.setExtra('query', ctx.request.query)
                Sentry.captureException(err)
              })
            }
            return
          }

          for (const err of ctx.errors) {
            // Add scoped report details and send to Sentry
            Sentry.withScope(scope => {
              // Annotate whether failing operation was query/mutation/subscription
              scope.setTag('kind', ctx.operation.operation)

              // Log query and variables as extras (make sure to strip out sensitive data!)
              scope.setExtra('query', ctx.request.query)
              scope.setExtra('variables', ctx.request.variables)

              if (err.path) {
                // We can also add the path as breadcrumb
                scope.addBreadcrumb({
                  category: 'query-path',
                  message: err.path.join(' > '),
                  level: Sentry.Severity.Debug
                })
              }

              const transactionId = ctx.request.http.headers.get(
                'x-transaction-id'
              )
              if (transactionId) {
                scope.setTransactionName(transactionId)
              }

              Sentry.captureException(err)
            })
          }
        }
      }
    }
  }
}
