'use strict'

const createStripe = require('stripe')
const { get } = require('lodash')

const { wardCredential, ward, is } = require('../../ward')

module.exports = ({ config, commands }) => {
  const errFn = wardCredential(config, {
    key: 'payment.stripe_key',
    env: 'TOM_STRIPE_KEY'
  })

  if (errFn) return errFn

  const stripe = createStripe(get(config, 'payment.stripe_key'))

  const payment = async ({ token, customerId, templateId }) => {
    ward(token, { label: 'token', test: is.object })
    ward(token.id, { label: 'token.id', test: is.string.nonEmpty })
    ward(customerId, { label: 'customerId', test: is.string.nonEmpty })

    const { id: source } = token
    await stripe.customers.update(customerId, { source })

    const { email } = await stripe.customers.retrieve(customerId)
    ward(email, {
      label: 'email',
      test: is.string.nonEmpty,
      message: `Not found the 'email' associated with the customer.`
    })

    return { customerId, email }
  }

  return payment
}
