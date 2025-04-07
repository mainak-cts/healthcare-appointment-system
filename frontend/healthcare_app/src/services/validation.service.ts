import { Injectable } from "@angular/core";
import { AbstractControl, ValidatorFn } from "@angular/forms";

// For custom form validators
@Injectable({providedIn: 'root'})
export class ValidationService{

    noWhiteSpaceMinLengthValidator(minLength: number): ValidatorFn {
        return (control: AbstractControl) => {
            const isWhiteSpace = (control.value || '').trim().length < minLength;
            return isWhiteSpace ? {whiteSpace: true}: null;
        }
    }
}