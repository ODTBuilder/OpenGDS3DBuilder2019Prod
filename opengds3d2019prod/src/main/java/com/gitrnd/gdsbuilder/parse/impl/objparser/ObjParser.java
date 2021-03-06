package com.gitrnd.gdsbuilder.parse.impl.objparser;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;

import org.geotools.referencing.GeodeticCalculator;

import com.gitrnd.gdsbuilder.parse.impl.objparser.objfile.DefaultObjFace;

import de.javagl.obj.FloatTuple;
import de.javagl.obj.Obj;
import de.javagl.obj.ObjFace;
import de.javagl.obj.ObjGroup;
import de.javagl.obj.ObjSplitting;
import de.javagl.obj.ObjUtils;
import de.javagl.obj.Objs;

/**
 * Obj 파일 수정 클래스
 * 
 * @author DY.Oh
 *
 */
public class ObjParser {

	/**
	 * Obj vertex 중 최대 z 값
	 */
	double maxHeight;

	public double getMaxHeight() {
		return maxHeight;
	}

	public void setMaxHeight(double maxHeight) {
		this.maxHeight = maxHeight;
	}

	/**
	 * ObjParser 생성자
	 * 
	 * @param originMaxHeight Obj vertex 중 최대 z 값
	 */
	public ObjParser(double originMaxHeight) {
		this.maxHeight = originMaxHeight;
	}

	/**
	 * ObjParser 생성자
	 */
	public ObjParser() {
		// TODO Auto-generated constructor stub
	}

	/**
	 * Obj 파일 수정, 원본 Obj 파일 내의 객체 편집
	 * 
	 * @param originObj   원본 Obj
	 * @param modifyObj   수정 Obj
	 * @param featureId   수정 Obj 객체 id
	 * @param centerXedit 수정 Obj 중점 x 좌표
	 * @param centerYedit 수정 Obj 중점 y 좌표
	 * @param centerXtile 원본 Obj 중점 x 좌표
	 * @param centerYtile 원본 Obj 중점 y 좌표
	 * @param usemtl      usemtl 명
	 * @return 편집 내역이 반영된 Obj
	 * 
	 * @author DY.Oh
	 */
	public Obj modifyObj(Obj originObj, Obj modifyObj, String featureId, double centerXedit, double centerYedit,
			double centerXtile, double centerYtile, String usemtl) {

		Obj newOriginObj = Objs.create();

		// vertex
		for (int v = 0; v < originObj.getNumVertices(); v++) {
			newOriginObj.addVertex(originObj.getVertex(v));
		}
		// texCoordIndices
		for (int t = 0; t < originObj.getNumVertices(); t++) {
			newOriginObj.addTexCoord(originObj.getTexCoord(t));
		}
		// normalIndex
		for (int n = 0; n < originObj.getNumVertices(); n++) {
			newOriginObj.addNormal(originObj.getNormal(n));
		}
		List<String> groupNames = new ArrayList<>();
		int numGroups = originObj.getNumGroups();
		for (int g = 0; g < numGroups; g++) {
			ObjGroup group = originObj.getGroup(g);
			if (!group.getName().equals(featureId)) {
				groupNames.add(group.getName());
				for (int f = 0; f < group.getNumFaces(); f++) {
					ObjFace face = group.getFace(f);
					Set<String> activatedGroupNames = originObj.getActivatedGroupNames(face);
					if (activatedGroupNames != null) {
						newOriginObj.setActiveGroupNames(activatedGroupNames);
					}
					String activatedMaterialGroupName = originObj.getActivatedMaterialGroupName(face);
					if (activatedMaterialGroupName != null) {
						newOriginObj.setActiveMaterialGroupName(activatedMaterialGroupName);
					}
					newOriginObj.addFace(face);
				}
			}
		}
		GeodeticCalculator gc = new GeodeticCalculator();
		gc.setStartingGeographicPoint(centerXtile, centerYedit);
		gc.setDestinationGeographicPoint(centerXedit, centerYedit);
		double xDistance = gc.getOrthodromicDistance();
		if (centerXtile > centerXedit) {
			xDistance = -xDistance;
		}
		gc.setStartingGeographicPoint(centerXedit, centerYtile);
		gc.setDestinationGeographicPoint(centerXedit, centerYedit);
		double yDistance = gc.getOrthodromicDistance();
		if (centerYtile > centerYedit) {
			yDistance = -yDistance;
		}

		Obj newModifytObj = Objs.create();
		// vertex
		for (int v = 0; v < modifyObj.getNumVertices(); v++) {
			FloatTuple vertex = modifyObj.getVertex(v);
			newModifytObj.addVertex((float) (vertex.getX() + xDistance), (float) (vertex.getY() + yDistance),
					vertex.getZ());
			if (vertex.getZ() > maxHeight) {
				maxHeight = vertex.getZ();
			}
		}
		// texCoordIndices
		for (int t = 0; t < modifyObj.getNumVertices(); t++) {
			newModifytObj.addTexCoord(modifyObj.getTexCoord(t).getX(), 1 - modifyObj.getTexCoord(t).getY());
		}
		// normalIndex
		for (int n = 0; n < modifyObj.getNumVertices(); n++) {
			newModifytObj.addNormal(modifyObj.getNormal(n));
		}
		List<String> groupNamesEdt = new ArrayList<>();
		int numGroupsEdt = modifyObj.getNumGroups();
		for (int g = 0; g < numGroupsEdt; g++) {
			ObjGroup group = modifyObj.getGroup(g);
			groupNamesEdt.add(group.getName());
			for (int f = 0; f < group.getNumFaces(); f++) {
				ObjFace face = group.getFace(f);
				List<String> gnames = new ArrayList<>();
				gnames.add(featureId);
				newModifytObj.setActiveGroupNames(gnames);
				newModifytObj.setActiveMaterialGroupName(usemtl);
				newModifytObj.addFace(face);
			}
		}

		Obj combinedObj = Objs.create();
		ObjUtils.add(newModifytObj, combinedObj);
		ObjUtils.add(newOriginObj, combinedObj);
		combinedObj.setMtlFileNames(originObj.getMtlFileNames());

		return combinedObj;
	}

	/**
	 * Obj 파일 수정, 원본 Obj 파일 내의 객체 삭제
	 * 
	 * @param originObj 원본 Obj
	 * @param featureId 삭제 Obj 객체 id
	 * @return 편집 내역이 반영된 Obj
	 * 
	 * @author DY.Oh
	 */
	public Obj deleteObj(Obj originObj, String featureId) {

		Obj newOriginObj = Objs.create();
		// vertex
		for (int v = 0; v < originObj.getNumVertices(); v++) {
			newOriginObj.addVertex(originObj.getVertex(v));
		}
		// texCoordIndices
		for (int t = 0; t < originObj.getNumVertices(); t++) {
			newOriginObj.addTexCoord(originObj.getTexCoord(t));
		}
		// normalIndex
		for (int n = 0; n < originObj.getNumVertices(); n++) {
			newOriginObj.addNormal(originObj.getNormal(n));
		}
		List<String> groupNames = new ArrayList<>();
		int numGroups = originObj.getNumGroups();
		for (int g = 0; g < numGroups; g++) {
			ObjGroup group = originObj.getGroup(g);
			if (!group.getName().equals(featureId)) {
				groupNames.add(group.getName());
				for (int f = 0; f < group.getNumFaces(); f++) {
					ObjFace face = group.getFace(f);
					Set<String> activatedGroupNames = originObj.getActivatedGroupNames(face);
					if (activatedGroupNames != null) {
						newOriginObj.setActiveGroupNames(activatedGroupNames);
					}
					String activatedMaterialGroupName = originObj.getActivatedMaterialGroupName(face);
					if (activatedMaterialGroupName != null) {
						newOriginObj.setActiveMaterialGroupName(activatedMaterialGroupName);
					}
					newOriginObj.addFace(face);
				}
			}
		}
		newOriginObj.setMtlFileNames(originObj.getMtlFileNames());

		return newOriginObj;
	}

	/**
	 * Obj 파일 내 featureId를 group name으로 가지는 ObjGroup을 1개의 Obj 객체로 생성
	 * 
	 * @param originObj   원본 Obj
	 * @param featureId   group name
	 * @param centerXedit group 중점 x 좌표
	 * @param centerYedit group 중점 y 좌표
	 * @param centerXtile 원본 Obj 중점 x 좌표
	 * @param centerYtile 원본 Obj 중점 y 좌표
	 * @return Obj
	 * 
	 * @author DY.Oh
	 */
	public Obj groupToObj(Obj originObj, String featureId, double centerXedit, double centerYedit, double centerXtile,
			double centerYtile) {

		// calculate distance
		GeodeticCalculator gc = new GeodeticCalculator();
		gc.setStartingGeographicPoint(centerXtile, centerYedit);
		gc.setDestinationGeographicPoint(centerXedit, centerYedit);
		double xDistance = gc.getOrthodromicDistance();
		if (centerXtile > centerXedit) {
			xDistance = -xDistance;
		}
		gc.setStartingGeographicPoint(centerXedit, centerYtile);
		gc.setDestinationGeographicPoint(centerXedit, centerYedit);
		double yDistance = gc.getOrthodromicDistance();
		if (centerYtile > centerYedit) {
			yDistance = -yDistance;
		}

		// featureId에 해당하는 feature get
		ObjGroup group = null;
		String useMtl = null;
		Map<String, Obj> materialGroups = ObjSplitting.splitByMaterialGroups(originObj);
		for (Entry<String, Obj> entry : materialGroups.entrySet()) {
			String materialName = entry.getKey();
			ObjGroup tmpGroup = originObj.getGroup(featureId);
			if (tmpGroup != null) {
				group = tmpGroup;
				useMtl = materialName;
			}
		}
		if (group == null) {
			group = originObj.getGroup(featureId);
		}

		// 단일 obj 파일로 write
		Obj groupObj = Objs.create();
		List<String> mtl = originObj.getMtlFileNames();
		if (mtl != null) {
			groupObj.setMtlFileNames(originObj.getMtlFileNames());
		}

		int numFaces = group.getNumFaces();
		// face
		for (int n = 0; n < numFaces; n++) {
			ObjFace face = group.getFace(n);
			Set<String> activatedGroupNames = originObj.getActivatedGroupNames(face);
			if (activatedGroupNames != null) {
				groupObj.setActiveGroupNames(activatedGroupNames);
			}
			// String activatedMaterialGroupName =
			// originObj.getActivatedMaterialGroupName(face);
			if (useMtl != null) {
				groupObj.setActiveMaterialGroupName(useMtl);
			}
			List<Integer> vertexIndices = new ArrayList<>();
			List<Integer> texCoordIndices = new ArrayList<>();
			List<Integer> normalIndices = new ArrayList<>();

			int numVertices = face.getNumVertices();
			for (int v = 0; v < numVertices; v++) {
				int vertexIdx = face.getVertexIndex(v);
				int texCoordIdx = face.getTexCoordIndex(v);
				int normalIdx = face.getNormalIndex(v);

				FloatTuple vertex = originObj.getVertex(vertexIdx);
				groupObj.addVertex((float) (-(xDistance - vertex.getX())), (float) (-(yDistance - vertex.getY())),
						vertex.getZ());
				groupObj.addTexCoord(originObj.getTexCoord(texCoordIdx));
				groupObj.addNormal(originObj.getNormal(normalIdx));

				vertexIndices.add(groupObj.getNumVertices() - 1);
				texCoordIndices.add(groupObj.getNumTexCoords() - 1);
				normalIndices.add(groupObj.getNumNormals() - 1);
			}
			DefaultObjFace newFace = new DefaultObjFace(vertexIndices.stream().mapToInt(i -> i).toArray(),
					texCoordIndices.stream().mapToInt(i -> i).toArray(),
					normalIndices.stream().mapToInt(i -> i).toArray());
			groupObj.addFace(newFace);
		}
		return groupObj;
	}
}
