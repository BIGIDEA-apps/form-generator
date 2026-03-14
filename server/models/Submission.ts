import mongoose, { Schema, type Document } from 'mongoose'

export interface ISubmission extends Document {
  formId: mongoose.Types.ObjectId
  formSlug: string
  formName: string
  company: string
  data: Record<string, any>
  submittedAt: Date
}

const SubmissionSchema = new Schema<ISubmission>(
  {
    formId: { type: Schema.Types.ObjectId, ref: 'Form', required: true, index: true },
    formSlug: { type: String, required: true, index: true },
    formName: { type: String, default: '' },
    company: { type: String, default: '' },
    data: { type: Schema.Types.Mixed, required: true },
    submittedAt: { type: Date, default: Date.now },
  },
)

SubmissionSchema.index({ formId: 1, submittedAt: -1 })

export const SubmissionModel = mongoose.models.Submission as mongoose.Model<ISubmission>
  || mongoose.model<ISubmission>('Submission', SubmissionSchema)
