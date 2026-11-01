import type { Access } from 'payload'

export const owner: Access = ({ req }) => Boolean(req.user && req.user.role === 'owner')

export const published: Access = ({ req }) => (req.user ? true : { published: { equals: true } })
