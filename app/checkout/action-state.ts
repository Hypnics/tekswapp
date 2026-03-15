export interface CheckoutActionState {
  status: 'idle' | 'error'
  message?: string
}

export const initialCheckoutActionState: CheckoutActionState = {
  status: 'idle',
}
