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
import { SalesManager } from "../entities/sales-manager.entity";
import { ApiProperty } from "@nestjs/swagger";

@ObjectType({ description: "Respuesta de salesmanager" })
export class SalesManagerResponse<T extends SalesManager> extends GQResponseBase {
  @ApiProperty({ type: SalesManager,nullable:false,description:"Datos de respuesta de SalesManager" })
  @Field(() => SalesManager, { description: "Instancia de SalesManager", nullable: true })
  data?: T;
}

@ObjectType({ description: "Respuesta de salesmanagers" })
export class SalesManagersResponse<T extends SalesManager> extends GQResponseBase {
  @ApiProperty({ type: [SalesManager],nullable:false,description:"Listado de SalesManager",default:[] })
  @Field(() => [SalesManager], { description: "Listado de SalesManager", nullable: false,defaultValue:[] })
  data: T[] = [];

  @ApiProperty({ type: Number,nullable:false,description:"Cantidad de SalesManager",default:0 })
  @Field(() => Number, { description: "Cantidad de SalesManager", nullable: false,defaultValue:0 })
  count: number = 0;
}






