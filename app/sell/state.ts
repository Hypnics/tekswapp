export interface PublishListingState {
  status: 'idle' | 'success' | 'error'
  message?: string
  technicalDetails?: string
}

export const initialPublishListingState: PublishListingState = {
  status: 'idle',
}
