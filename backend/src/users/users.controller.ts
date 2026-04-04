import { Controller, Get, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@authentication/guard/jwt.guard';
@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('/me')
  @UseGuards(JwtAuthGuard)
  getMe(@Req() req) {
    return this.usersService.getMe(req.user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @UseGuards(JwtAuthGuard)
  getAllUsers() {
    return this.usersService.getAllUsers();
  }

  @Get('username/:username')
  findByUsername(@Param('username') username: string) {
    return this.usersService.getProfileByUsername(username);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.usersService.findOneUserById(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateUserById(id, updateUserDto);
  }

  @Patch('/me/username')
  @UseGuards(JwtAuthGuard)
  updateUsername(@Req() req, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateMyUsername(req.user.userId, updateUserDto.username);
  }

  @Patch('/me/password')
  @UseGuards(JwtAuthGuard)
  updatePassword(@Req() req, @Body() changePasswordDto: ChangePasswordDto) {
    return this.usersService.updateMyPassword(req.user.userId, changePasswordDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @Req() req) {
    return this.usersService.removeUserById(id, req.user.userId);
  }
}
