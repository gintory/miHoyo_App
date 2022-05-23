import React, { useState } from 'react'
import { request } from "../../network/request";
import { Menu, Dropdown, notification, Modal, Button, Form, Input } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import './changePassword.css'

export default function ChangePassword(props) {
    const navigate = useNavigate();
    const [filterInfo, setFilterInfo] = useState({
        oldPassword:'',
        newPassword:'',
        confirmNewPassword:''
    })
    async function handleChangePassword(){
        if(check()){
            let data = {
                userId: localStorage.getItem('userId'),
                oldPassword: filterInfo.oldPassword,
                newPassword: filterInfo.newPassword
            }
            console.log(data)
            const res = await request({
                url: "/api/changePassword",
                method: "post",
                data: data
            });
            data = res.data.data;
            console.log(data);
            if(data.code == 200){
                notification.success({
                    description: '修改成功！',
                    message: '通知',
                    duration: 2,
                    onClose: () => {
                    }
                })
                navigate('/home/pictureShow');
            }else if(data.code == 201){
                notification.error({
                    description: '密码错误，请重新输入！',
                    message: '警告',
                    duration: 2,
                });
            }
            setFilterInfo({
                oldPassword:'',
                newPassword:'',
                confirmNewPassword:''
            })
        }
    }
    function handleInputChange(event) {
        const value = event.target.value;
        setFilterInfo({ ...filterInfo, [event.target.name]: value });
    }
    function check(){
        if(filterInfo.newPassword!=filterInfo.confirmNewPassword){
            notification.error({
                description: '两次密码不一致，请重新输入！',
                message: '警告',
                duration: 2,
            });
            setFilterInfo({
                oldPassword:'',
                newPassword:'',
                confirmNewPassword:''
            })
            return false
        }else{
            return true
        }
    }

    return(
        <div className="changePassword">
            <div className="changePassword-content">
                <div className="upload_header">修改密码</div>
                <div className="change_form">
                    <div className="change_form_item">
                        <span className='change_form_span'>当前密码：</span>
                        <Input className='change_form_input'
                            type='password'
                            value={ filterInfo.oldPassword } 
                            onChange={ handleInputChange } 
                            name="oldPassword">
                        </Input>
                    </div>
                    <div className="change_form_item">
                        <span className='change_form_span'>修改密码：</span>
                        <Input className='change_form_input'
                            type='password'
                            value={ filterInfo.newPassword } 
                            onChange={ handleInputChange } 
                            name="newPassword">
                        </Input>
                    </div>
                    <div className="change_form_item">
                        <span className='change_form_span'>确认修改密码：</span>
                        <Input className='change_form_input'
                            type='password'
                            value={ filterInfo.confirmNewPassword } 
                            onChange={ handleInputChange } 
                            name="confirmNewPassword">
                        </Input>
                    </div>
                    <Button type='primary' onClick={handleChangePassword}>确认修改</Button>
                </div>
            </div>
        </div>
    )
}