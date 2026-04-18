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


import { ObjectType, Field } from "@nestjs/graphql";
import { GQResponseBase } from "src/common/types/common.types";
import { Login } from "../entities/login.entity";
import { ApiProperty } from "@nestjs/swagger";

@ObjectType({ description: "Respuesta de login" })
export class LoginResponse<T extends Login> extends GQResponseBase {
  @ApiProperty({ type: Login,nullable:false,description:"Datos de respuesta de Login" })
  @Field(() => Login, { description: "Instancia de Login", nullable: true })
  data?: T;

  @ApiProperty({ type: String, nullable: true, description: "Access token emitido por security" })
  @Field(() => String, { description: "Access token emitido por security", nullable: true })
  accessToken?: string;

  @ApiProperty({ type: String, nullable: true, description: "Refresh token emitido por security" })
  @Field(() => String, { description: "Refresh token emitido por security", nullable: true })
  refreshToken?: string;

  @ApiProperty({ type: String, nullable: true, description: "Código de sesión emitido" })
  @Field(() => String, { description: "Código de sesión emitido", nullable: true })
  sessionCode?: string;

  @ApiProperty({ type: String, nullable: true, description: "Identificador del usuario autenticado" })
  @Field(() => String, { description: "Identificador del usuario autenticado", nullable: true })
  userId?: string;

  @ApiProperty({ type: Date, nullable: true, description: "Fecha de expiración de la sesión" })
  @Field(() => Date, { description: "Fecha de expiración de la sesión", nullable: true })
  expiresAt?: Date;

  @ApiProperty({ type: Boolean, nullable: true, description: "Indica que la cuenta requiere activación por PIN antes de autenticarse" })
  @Field(() => Boolean, { description: "Indica si se requiere activación por PIN", nullable: true })
  activationRequired?: boolean;

  @ApiProperty({ type: String, nullable: true, description: "PIN de activación de 6 dígitos (solo en modo LOCAL)" })
  @Field(() => String, { description: "PIN de activación en modo LOCAL", nullable: true })
  activationPin?: string;

  @ApiProperty({ type: String, nullable: true, description: "Modo de entrega del PIN: LOCAL, SMS, EMAIL" })
  @Field(() => String, { description: "Modo de entrega del PIN", nullable: true })
  deliveryMode?: string;
}

@ObjectType({ description: "Respuesta de logins" })
export class LoginsResponse<T extends Login> extends GQResponseBase {
  @ApiProperty({ type: [Login],nullable:false,description:"Listado de Login",default:[] })
  @Field(() => [Login], { description: "Listado de Login", nullable: false,defaultValue:[] })
  data: T[] = [];

  @ApiProperty({ type: Number,nullable:false,description:"Cantidad de Login",default:0 })
  @Field(() => Number, { description: "Cantidad de Login", nullable: false,defaultValue:0 })
  count: number = 0;
}



@ObjectType({ description: "Devuelve los datos mínimos necesarios para continuar el flujo federado." })
export class FederatedLoginStartResponse extends GQResponseBase {
  @ApiProperty({ type: String, nullable: true, description: "Código del proveedor federado" })
  @Field(() => String, { description: "Código del proveedor federado", nullable: true })
  providerCode?: string;

  @ApiProperty({ type: String, nullable: true, description: "URL de retorno indicada por el consumidor" })
  @Field(() => String, { description: "URL de retorno indicada por el consumidor", nullable: true })
  redirectUri?: string;

  @ApiProperty({ type: String, nullable: true, description: "URL de autorización del proveedor" })
  @Field(() => String, { description: "URL de autorización del proveedor", nullable: true })
  authorizationUrl?: string;

  @ApiProperty({ type: String, nullable: true, description: "State del flujo federado" })
  @Field(() => String, { description: "State del flujo federado", nullable: true })
  state?: string;

}

@ObjectType({ description: "Devuelve los datos de la sesión cerrada." })
export class LogoutResponse extends GQResponseBase {
  @ApiProperty({ type: String, nullable: true, description: "Código de sesión cerrada" })
  @Field(() => String, { description: "Código de sesión cerrada", nullable: true })
  sessionCode?: string;

  @ApiProperty({ type: Date, nullable: true, description: "Momento del cierre de sesión" })
  @Field(() => Date, { description: "Momento del cierre de sesión", nullable: true })
  logoutAt?: Date;

}



