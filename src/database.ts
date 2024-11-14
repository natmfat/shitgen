import { MockDatabase } from "./MockDatabase";
import { Model } from "./client/Model";
export { sql } from "./client/sql";
const database = new MockDatabase({
    "types": {
        "provider_name_": {
            "name": "provider_name_",
            "type": "enum",
            "typeArgs": [
                "google",
                "github",
                "discord"
            ]
        }
    },
    "tables": {
        "palette_": {
            "name": "palette_",
            "columns": [
                {
                    "name": "id",
                    "type": "bigint",
                    "modifierPrimaryKey": false,
                    "modifierNotNull": true,
                    "modifierDefault": true,
                    "reference": null
                },
                {
                    "name": "name",
                    "type": "text",
                    "modifierPrimaryKey": false,
                    "modifierNotNull": true,
                    "modifierDefault": false,
                    "reference": null
                },
                {
                    "name": "thumbnail_colors",
                    "type": "text[]",
                    "modifierPrimaryKey": false,
                    "modifierNotNull": false,
                    "modifierDefault": false,
                    "reference": null
                },
                {
                    "name": "raw_css",
                    "type": "text",
                    "modifierPrimaryKey": false,
                    "modifierNotNull": true,
                    "modifierDefault": false,
                    "reference": null
                }
            ]
        },
        "provider_": {
            "name": "provider_",
            "columns": [
                {
                    "name": "id",
                    "type": "bigint",
                    "modifierPrimaryKey": true,
                    "modifierNotNull": true,
                    "modifierDefault": true,
                    "reference": null
                },
                {
                    "name": "name",
                    "type": "provider_name_",
                    "modifierPrimaryKey": false,
                    "modifierNotNull": true,
                    "modifierDefault": false,
                    "reference": null
                },
                {
                    "name": "profile_id",
                    "type": "text",
                    "modifierPrimaryKey": false,
                    "modifierNotNull": true,
                    "modifierDefault": false,
                    "reference": null
                }
            ]
        },
        "project_": {
            "name": "project_",
            "columns": [
                {
                    "name": "id",
                    "type": "uuid",
                    "modifierPrimaryKey": true,
                    "modifierNotNull": true,
                    "modifierDefault": true,
                    "reference": null
                },
                {
                    "name": "palette_id",
                    "type": "bigint",
                    "modifierPrimaryKey": false,
                    "modifierNotNull": true,
                    "modifierDefault": true,
                    "reference": {
                        "tableName": "palette_",
                        "columnName": "id"
                    }
                },
                {
                    "name": "prompt",
                    "type": "text",
                    "modifierPrimaryKey": false,
                    "modifierNotNull": true,
                    "modifierDefault": false,
                    "reference": null
                },
                {
                    "name": "public",
                    "type": "boolean",
                    "modifierPrimaryKey": false,
                    "modifierNotNull": false,
                    "modifierDefault": true,
                    "reference": null
                }
            ]
        },
        "preview_": {
            "name": "preview_",
            "columns": [
                {
                    "name": "id",
                    "type": "bigint",
                    "modifierPrimaryKey": false,
                    "modifierNotNull": true,
                    "modifierDefault": true,
                    "reference": null
                },
                {
                    "name": "project_id",
                    "type": "uuid",
                    "modifierPrimaryKey": false,
                    "modifierNotNull": true,
                    "modifierDefault": false,
                    "reference": {
                        "tableName": "project_",
                        "columnName": "id"
                    }
                },
                {
                    "name": "version",
                    "type": "smallint",
                    "modifierPrimaryKey": false,
                    "modifierNotNull": false,
                    "modifierDefault": true,
                    "reference": null
                },
                {
                    "name": "prompt",
                    "type": "text",
                    "modifierPrimaryKey": false,
                    "modifierNotNull": true,
                    "modifierDefault": false,
                    "reference": null
                },
                {
                    "name": "code",
                    "type": "text",
                    "modifierPrimaryKey": false,
                    "modifierNotNull": false,
                    "modifierDefault": false,
                    "reference": null
                },
                {
                    "name": "thumbnail_src",
                    "type": "text",
                    "modifierPrimaryKey": false,
                    "modifierNotNull": false,
                    "modifierDefault": false,
                    "reference": null
                }
            ]
        }
    }
});
export enum ProviderName {
  GOOGLE = "google",
  GITHUB = "github",
  DISCORD = "discord"
}
export type PaletteData = {
  id: number;
  name: string;
  thumbnail_colors: Array<string> | null;
  raw_css: string;
}
export type PaletteAutoGenerated = never;
export type PaletteOptional = "id";
export type PaletteRelationship = {
}
const palette = new Model<PaletteData, PaletteAutoGenerated, PaletteOptional, PaletteRelationship>("palette_", database);
export type ProviderData = {
  id: number;
  name: ProviderName;
  profile_id: string;
}
export type ProviderAutoGenerated = "id";
export type ProviderOptional = "id";
export type ProviderRelationship = {
}
const provider = new Model<ProviderData, ProviderAutoGenerated, ProviderOptional, ProviderRelationship>("provider_", database);
export type ProjectData = {
  id: string;
  palette_id: number;
  prompt: string;
  public: boolean | null;
}
export type ProjectAutoGenerated = "id";
export type ProjectOptional = "id" | "palette_id" | "public";
export type ProjectRelationship = {
  palette_id: PaletteData;
}
const project = new Model<ProjectData, ProjectAutoGenerated, ProjectOptional, ProjectRelationship>("project_", database);
export type PreviewData = {
  id: number;
  project_id: string;
  version: number | null;
  prompt: string;
  code: string | null;
  thumbnail_src: string | null;
}
export type PreviewAutoGenerated = never;
export type PreviewOptional = "id" | "version";
export type PreviewRelationship = {
  project_id: ProjectData;
}
const preview = new Model<PreviewData, PreviewAutoGenerated, PreviewOptional, PreviewRelationship>("preview_", database);
export const shitgen = { palette, provider, project, preview };