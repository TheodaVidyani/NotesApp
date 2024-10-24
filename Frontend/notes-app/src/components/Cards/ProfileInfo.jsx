import React from 'react'
import { getInitials } from '../../utils/helper'


const ProfileInfo = ({userInfo, onLogout}) => {
   // Ensure userInfo exists and has fullName; provide fallback if necessary
   const fullName = userInfo?.fullName || 'Unknown User';
   const initials = getInitials(userInfo?.fullName || 'UU'); // Provide fallback for initials
 
  return (
    <div className="flex items-center gap-3">
        <div className="w-12 h-12 flex items-center justify-center rounded-full text-slate-950 font-medium bg-slate-100">
        {initials}
        </div>
      <p className="text-sm font-medium">{fullName}</p>
      <button className="text-sm text-slate-700 uderline" onClick={onLogout}>
        Logout
      </button>
    </div>
  )
}

export default ProfileInfo
