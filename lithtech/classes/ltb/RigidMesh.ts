import * as t from '../../../mod.ts';
import { FieldExpose, FieldSetup, FieldType, ParserTarget } from '../../../mod.ts';
import { MeshType } from './enums/MeshType.ts';
import { LodMeshInfo } from './LodMeshInfo.ts';
import { VertexContainer } from './VertexContainer.ts';

@ParserTarget()
export class RigidMesh extends LodMeshInfo {
    declare objSize: number;
    declare numVertexes: number;
    declare numFaces: number;
    declare maxBonesPerFace: number;
    declare maxBonesPerVert: number;

    @FieldType(t.Array, { item: t.Uint32, count: 4 })
    @FieldExpose()
    vertexTypeMap!: number[];

    @FieldType(t.Uint32)
    bone!: number;

    @FieldType(t.Array, { item: VertexContainer, count: 4 })
    vertexContainer!: VertexContainer[];

    @FieldType(t.Array, {
        item: t.Uint16,
        count: (_: t.ParserContext, scope: t.ScopeAccessor) => scope.numFaces * 3,
    })
    vertexIndex!: number[];
}
