import mongoose, { Schema, type Document } from 'mongoose'

export interface ISubmission extends Document {
  formId: mongoose.Types.ObjectId
  formSlug: string
  data: Record<string, any>
  submittedAt: Date
}

const SubmissionSchema = new Schema<ISubmission>(
  {
    formId: { type: Schema.Types.ObjectId, ref: 'Form', required: true },
    formSlug: { type: String, required: true, index: true },
    data: { type: Schema.Types.Mixed, required: true },
    submittedAt: { type: Date, default: Date.now },
  },
)

export const SubmissionModel = mongoose.models.Submission as mongoose.Model<ISubmission>
  || mongoose.model<ISubmission>('Submission', SubmissionSchema)
