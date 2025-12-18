'use client'

import { Fragment, ReactNode } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  title?: string
  description?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
}

export function Modal({ 
  isOpen, 
  onClose, 
  children, 
  title,
  description,
  size = 'md',
}: ModalProps) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-[#0c0a15]/80 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel 
                className={`w-full ${sizeClasses[size]} transform overflow-hidden rounded-3xl glass p-8 text-left align-middle shadow-2xl shadow-[#a855f7]/10 transition-all`}
              >
                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 rounded-xl text-[#6b6480] hover:text-[#f0eef5] hover:bg-[#1e1830] transition-all"
                >
                  <X className="h-5 w-5" />
                </button>

                {title && (
                  <Dialog.Title
                    as="h3"
                    className="text-2xl font-bold text-[#f0eef5] mb-2"
                    style={{ fontFamily: 'var(--font-playfair), serif' }}
                  >
                    {title}
                  </Dialog.Title>
                )}

                {description && (
                  <Dialog.Description className="text-[#a9a4b8] mb-6">
                    {description}
                  </Dialog.Description>
                )}

                {children}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'primary'
  loading?: boolean
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'primary',
  loading = false,
}: ConfirmModalProps) {
  const buttonColors = {
    danger: 'bg-gradient-to-r from-[#f43f5e] to-[#e11d48] shadow-[#f43f5e]/25',
    primary: 'bg-gradient-to-r from-[#14b8a6] to-[#0d9488] shadow-[#14b8a6]/25',
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} description={description}>
      <div className="flex gap-3 justify-end mt-6">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onClose}
          className="px-6 py-3 rounded-xl text-[#a9a4b8] hover:text-[#f0eef5] hover:bg-[#1e1830] transition-all font-medium"
        >
          {cancelText}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onConfirm}
          disabled={loading}
          className={`px-6 py-3 rounded-xl text-white font-semibold shadow-lg ${buttonColors[variant]} disabled:opacity-50`}
        >
          {loading ? (
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full mx-auto"
            />
          ) : confirmText}
        </motion.button>
      </div>
    </Modal>
  )
}
