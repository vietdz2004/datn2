import React from "react";
import styles from "./OrderDetailModal.module.css";

const NO_IMAGE = "/no-image.png";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5002';

function getProductImageUrl(img) {
  if (!img) return NO_IMAGE;
  if (img.startsWith('http://') || img.startsWith('https://')) return img;

  // Normalize slashes and remove leading 'public/'
  const cleanedImg = img.replace(/\\/g, '/').replace(/^public\//, '');

  if (cleanedImg.startsWith('images/')) {
    return `${BACKEND_URL}/${cleanedImg}`;
  }
  
  if (cleanedImg.startsWith('/images/')) {
    return `${BACKEND_URL}${cleanedImg}`;
  }

  // Fallback for just a filename
  return `${BACKEND_URL}/images/products/${cleanedImg.replace(/^.*\//, '')}`;
}

export default function OrderProductTable({ products }) {
  return (
    <div className={styles["order-modal-products-table-wrapper"]}>
      <table className={styles["order-modal-products-table"]} style={{fontSize:15, width:'100%'}}>
        <thead>
          <tr style={{background:'#f3f4f6'}}>
            <th style={{fontWeight:600, padding:'8px', borderBottom:'1.5px solid #e5e7eb'}}>Ảnh</th>
            <th style={{fontWeight:600, padding:'8px', borderBottom:'1.5px solid #e5e7eb'}}>Tên SP</th>
            <th style={{fontWeight:600, padding:'8px', borderBottom:'1.5px solid #e5e7eb', textAlign:'center'}}>SL</th>
            <th style={{fontWeight:600, padding:'8px', borderBottom:'1.5px solid #e5e7eb', textAlign:'center'}}>Giá</th>
            <th style={{fontWeight:600, padding:'8px', borderBottom:'1.5px solid #e5e7eb', textAlign:'center'}}>Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          {(products || []).map((sp, i) => {
            const ten = sp.tenSp || sp.tenSanPham || sp.name || '-';
            const soLuong = sp.soLuongMua || sp.soLuong || sp.quantity || 1;
            const donGia = sp.donGiaLucMua || sp.gia || sp.price || sp.originalPrice || sp.thanhTien || 0;
            const thanhTien = sp.thanhTien || (donGia * soLuong);
            const imgRaw = sp.hinhAnh || sp.image || sp.anh || sp.img || '';
            const img = getProductImageUrl(imgRaw);
            return (
              <tr key={i} style={{transition:'background 0.2s'}} onMouseOver={e=>e.currentTarget.style.background='#f8fafc'} onMouseOut={e=>e.currentTarget.style.background=''}>
                <td style={{padding:'8px', textAlign:'center'}}>
                  <img
                    src={img}
                    alt={ten}
                    style={{width:38, height:38, objectFit:'cover', borderRadius:8, boxShadow:'0 1px 4px #0001'}}
                    onError={e => { e.target.onerror = null; e.target.src = NO_IMAGE; }}
                  />
                </td>
                <td style={{padding:'8px', fontWeight:500}}>{ten}</td>
                <td style={{padding:'8px', textAlign:'center'}}>{soLuong}</td>
                <td style={{padding:'8px', textAlign:'center'}}>{donGia ? Number(donGia).toLocaleString('vi-VN') : '-'}</td>
                <td style={{padding:'8px', textAlign:'center', fontWeight:600, color:'#0ea5e9'}}>{thanhTien ? Number(thanhTien).toLocaleString('vi-VN') : '-'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
} 