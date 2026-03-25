import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

const plan = v.union(v.literal('free'), v.literal('pro'))
const formStatus = v.union(v.literal('draft'), v.literal('published'))

export default defineSchema({
  users: defineTable({
    clerkUserId: v.string(),
    email: v.optional(v.string()),
    name: v.optional(v.string()),
    plan,
    stripeCustomerId: v.optional(v.string()),
    stripeSubscriptionId: v.optional(v.string()),
    currentPeriodEnd: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index('by_clerk_user_id', ['clerkUserId']),

  forms: defineTable({
    userId: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    status: formStatus,
    slug: v.optional(v.string()),
    allowMultipleResponses: v.optional(v.boolean()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_user_id', ['userId'])
    .index('by_slug', ['slug']),

  formFields: defineTable({
    formId: v.id('forms'),
    type: v.string(),
    label: v.string(),
    placeholder: v.optional(v.string()),
    required: v.optional(v.boolean()),
    options: v.optional(v.array(v.string())),
    validation: v.optional(v.any()),
    position: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index('by_form_id_and_position', ['formId', 'position']),

  submissions: defineTable({
    formId: v.id('forms'),
    userId: v.optional(v.string()),
    visitorToken: v.optional(v.string()),
    data: v.any(),
    createdAt: v.number(),
  }).index('by_form_id_and_created_at', ['formId', 'createdAt']),

  formViews: defineTable({
    formId: v.id('forms'),
    userId: v.optional(v.string()),
    visitorToken: v.optional(v.string()),
    createdAt: v.number(),
  }).index('by_form_id', ['formId']),

  aiGenerations: defineTable({
    userId: v.string(),
    description: v.string(),
    createdAt: v.number(),
  }).index('by_user_id_and_created_at', ['userId', 'createdAt']),

  formCreationEvents: defineTable({
    userId: v.string(),
    formId: v.id('forms'),
    createdAt: v.number(),
  }).index('by_user_id_and_created_at', ['userId', 'createdAt']),

  submissionEvents: defineTable({
    userId: v.string(),
    formId: v.id('forms'),
    submissionId: v.id('submissions'),
    createdAt: v.number(),
  }).index('by_user_id_and_created_at', ['userId', 'createdAt']),

  billingProfiles: defineTable({
    userId: v.string(),
    plan,
    stripeCustomerId: v.optional(v.string()),
    stripeSubscriptionId: v.optional(v.string()),
    status: v.optional(v.string()),
    currentPeriodEnd: v.optional(v.number()),
    cancelAtPeriodEnd: v.optional(v.boolean()),
    updatedAt: v.number(),
  })
    .index('by_user_id', ['userId'])
    .index('by_stripe_customer_id', ['stripeCustomerId']),

  billingEvents: defineTable({
    userId: v.string(),
    eventType: v.string(),
    stripeObjectId: v.optional(v.string()),
    payload: v.any(),
    createdAt: v.number(),
  }).index('by_user_id_and_created_at', ['userId', 'createdAt']),
})
