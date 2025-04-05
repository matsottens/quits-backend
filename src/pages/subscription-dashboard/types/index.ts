import * as React from 'react'; // Fixed import
import { type ClassValue } from "clsx"

export type ClassNameValue = ClassValue

export interface BaseProps {
  className?: string
}

export interface BaseComponentProps<T = HTMLDivElement> extends BaseProps {
  children?: React.ReactNode
  ref?: React.Ref<T>
}

export interface BaseInputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    BaseProps {}

export interface BaseButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    BaseProps {}

export interface BaseLabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement>,
    BaseProps {}

export interface BaseSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement>,
    BaseProps {}

export interface BaseTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    BaseProps {} 