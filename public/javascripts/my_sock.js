 var entityMap = {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': '&quot;',
                "'": '&#39;',
                "/": '&#x2F;'
              };

              function escapeHtml(string) {
                return String(string).replace(/[&<>"'\/]/g, function (s) {
                  return entityMap[s];
                });
              }
              var name = ''
            var socket_addrs=''
            $('document').ready(function(){
            $('#send_message').hide();
            $('#Recv').hide();
            var socket=io();
            socket.on('msg_from_client',function(msg){
            if(socket_addrs==msg.sender_addr){
            $('#rec_msg').append(msg.my_name + " : " + escapeHtml(msg.message)+'<br>');
            $("#rec_msg").animate({ scrollTop: $('#rec_msg')[0].scrollHeight}, 500);
            }
            else alert("New mesage from " + msg.my_name)


            });
            socket.emit('user_name',"#{user_name}");
            socket.on('users_online',function(user_list){
            $('#Div1').empty();
            for(i=0;i<user_list.length;i++)
            if(user_list[i].msg!="#{user_name}")
            {
            $('#Div1').append('<a href="" id='+user_list[i].my_id+'>'+user_list[i].msg+'</a>'+"<br/>");
            if(user_list[i].msg==name)
            socket_addrs = user_list[i].my_id
            }
            $('a').click(function(e){
            e.preventDefault();
            name = $(this).text();
            get_msg = {user1:"#{user_name}",user2:name}
            socket.emit('fetch_msgs',get_msg);
            
            $('#sending_to').html('<h3>You are sending message to '+ name+'</h3>');
            socket_addrs = $(this).attr('id');
            $('#send_message').show();
            $('#Recv').show();
                                    });                        
            });
            socket.on('display_msgs',function(result){
            $('#rec_msg').empty();
            for(i=result.length-1;i>=0;i--)
            $('#rec_msg').append(result[i].sender+' : ' + result[i].message+'<br/>');
            $("#rec_msg").animate({ scrollTop: $('#rec_msg')[0].scrollHeight}, 500);
            });

            $('#send_msg').click(function(){
            var msg = $('#msg_val').val();
            var s = {my_name:"#{user_name}",message:msg,addr:socket_addrs,sender_addr:socket.id}
            $('#msg_val').val('');
            $('#rec_msg').append('You sended : '+ escapeHtml(msg)+'<br>');
            socket.emit('user_clicked',s); 
                                            });


            $(window).on('beforeunload', function(){
                socket.close();
                });
            });