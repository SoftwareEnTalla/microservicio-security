/*
 * Copyright (c) 2026 SoftwarEnTalla
 * Licencia: MIT
 * Contacto: softwarentalla@gmail.com
 * CEOs: 
 *       Persy Morell Guerra      Email: pmorellpersi@gmail.com  Phone : +53-5336-4654 Linkedin: https://www.linkedin.com/in/persy-morell-guerra-288943357/
 *       Dailyn García Domínguez  Email: dailyngd@gmail.com      Phone : +53-5432-0312 Linkedin: https://www.linkedin.com/in/dailyn-dominguez-3150799b/
 *
 * CTO: Persy Morell Guerra
 * COO: Dailyn García Domínguez and Persy Morell Guerra
 * CFO: Dailyn García Domínguez and Persy Morell Guerra
 *
 * Repositories: 
 *               https://github.com/SoftwareEnTalla 
 *
 *               https://github.com/apokaliptolesamale?tab=repositories
 *
 *
 * Social Networks:
 *
 *              https://x.com/SoftwarEnTalla
 *
 *              https://www.facebook.com/profile.php?id=61572625716568
 *
 *              https://www.instagram.com/softwarentalla/
 *              
 *
 *
 */


import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from "class-validator";
import { CreateProviderTypeDto, UpdateProviderTypeDto } from "../dtos/all-dto";
import { createUnionType } from "@nestjs/graphql";

@ValidatorConstraint({ name: "isCreateOrUpdateProviderTypeDtoType", async: false })
export class IsProviderTypeTypeConstraint implements ValidatorConstraintInterface {
  validate(value: any) {
    // Verifica si el valor es un objeto y tiene la estructura esperada
    return (
      value instanceof CreateProviderTypeDto || value instanceof UpdateProviderTypeDto
    );
  }

  defaultMessage() {
    return "El valor debe ser un objeto de tipo CreateProviderTypeDto o UpdateProviderTypeDto";
  }
}

export function isCreateOrUpdateProviderTypeDtoType(
  validationOptions?: ValidationOptions
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsProviderTypeTypeConstraint,
    });
  };
}

// Crear un tipo de unión para GraphQL
export const ProviderTypeUnion = createUnionType({
  name: 'ProviderTypeUnion',
  types: () => [CreateProviderTypeDto, UpdateProviderTypeDto] as const,
});

