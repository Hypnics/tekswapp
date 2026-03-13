export interface PublishListingState {
  status: 'idle' | 'success' | 'error'
  message?: string
}

export const initialPublishListingState: PublishListingState = {
  status: 'idle',
}
