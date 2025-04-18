import { Injectable } from "@angular/core";
import { AbstractControl, ValidatorFn } from "@angular/forms";

// For custom form validators
@Injectable({providedIn: 'root'})
export class ValidationService{

    // Checks whether ihe input satisfies the minimum length, after trimming the whitespaces
    noWhiteSpaceMinLengthValidator(minLength: number): ValidatorFn {
        return (control: AbstractControl) => {
            const isWhiteSpace = (control.value || '').trim().length < minLength;
            // if isWhiteSpace is true, input is invalid, else valid (return 'null')
            return isWhiteSpace ? {whiteSpace: true}: null;
        }
    }
}