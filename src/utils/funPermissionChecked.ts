import { useRoute } from "vue-router";
import { useFunPermissionStoreWithOut } from '@/store/modules/funPermission'
import type { feature } from "@/store/modules/funPermission";
import { getFeatureAuthority } from '@/api/login'
import type { AuthorityParam, FeatureAuthority } from '@/api/login'

const parsePermissions = (value: string | FeatureAuthority[]): FeatureAuthority[] => {
  if (Array.isArray(value)) return value
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const checkFunPermission = (feature: string) => {
  const route = useRoute();
  const permission = useFunPermissionStoreWithOut().cachedPermission.get(route.path) || []
  return permission.some((item) => item.feature === feature && item.visible)
};

const getFunPermission = () => {
  const route = useRoute();
  const permission = useFunPermissionStoreWithOut().cachedPermission.get(route.path);
  if (permission && permission.length > 0) {
    return permission[0];
  }
  return {};
};

const checkFunPermissionAsync = async (path: string, feature: string | string[], validFeature = "") => {
  const isBoolean = typeof feature === "string" || validFeature;
  const permissionStore = useFunPermissionStoreWithOut()
  let permission = permissionStore.cachedPermission.get(path);
  if (!permission) {
    const param: AuthorityParam = {
      controllerName: path,
      features: typeof feature === "string" ? [feature] : feature
    };
    const [error, response] = await getFeatureAuthority(param)
    if (error || !response) return isBoolean ? false : []
    permission = parsePermissions(response)
    permissionStore.setPermission(path, permission)
  }
  if (permission?.length) {
    if (isBoolean) {
      const self: any = permission.find((it) => it.feature === (typeof feature === "string" ? feature : validFeature)) || {};
      return (self?.visible || false) as boolean;
    }
    return permission;
  }
  return isBoolean ? false : [];
};

const checkFunPermissionWith = (feature: string) => {
  const route = useRoute();
  const permission = useFunPermissionStoreWithOut().cachedPermission.get(route.path);
  if (permission && permission.length > 0) {
    const self: any = permission?.find((it) => it.feature === feature) || {};
    return (self?.visible || false) as boolean;
  }
  return false;
};

export {
  feature,
  checkFunPermission,
  getFunPermission,
  checkFunPermissionWith,
  checkFunPermissionAsync
};
